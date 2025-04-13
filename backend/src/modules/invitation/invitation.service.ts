import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import {
  IInvitation,
  InvitationDocStatus,
  InvitationStatus,
} from "src/interfaces/invitation.interface";
import { IUser } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import logger from "src/utils/logger/logger";
import { InvitationSchemaType } from "src/validators/invitation.validator";
import { TeamService } from "../team/team.service";
import { ActivityService } from "../activities/activities.service";
import { Helper } from "src/utils/helpers";
import { AuthServices } from "../auth/auth.service";

export class InvitationService {
  private teamService: TeamService;
  private activityService: ActivityService;
  private authService: AuthServices;
  private helper: Helper;

  constructor() {
    this.inviteMember = this.inviteMember.bind(this);
    this.respond = this.respond.bind(this);
    this.myInvitations = this.myInvitations.bind(this);
    this.cancelInvitation = this.cancelInvitation.bind(this);

    // Constructors
    this.teamService = new TeamService();
    this.activityService = new ActivityService();
    this.helper = new Helper();
    this.authService = new AuthServices();
  }

  // Invite a person to a team
  async inviteMember(invitationData: InvitationSchemaType, userId: string) {
    return await db.runTransaction(async (transaction) => {
      // Check if team exists
      const teamSnapshot = await db
        .collection(COLLECTIONS.TEAMS)
        .doc(invitationData.teamId)
        .get();

      if (!teamSnapshot.exists) {
        throw new ApiError("Team does not exist.", 400);
      }

      // Check if the user is already in a team
      const invitationSnapShot = await db
        .collection(COLLECTIONS.INVITATIONS)
        .where("teamId", "==", invitationData.teamId)
        .where("inviteeEmail", "==", invitationData.inviteeEmail)
        .where("inviteeLeft", "==", false)
        .get();

      // If the user has already been invited, throw an error
      if (!invitationSnapShot.empty) {
        throw new ApiError(
          `User with email ${invitationData.inviteeEmail} has already been invited to team ${invitationData.teamId}.`,
          400
        );
      }

      // New invitation
      const newInvitation: IInvitation = {
        ...invitationData,
        ...this.helper.fillTimeStamp(),
        invitationStatus: "pending",
        inviteeLeft: false,
        status: "active",
      };

      const invitationRef = db.collection(COLLECTIONS.INVITATIONS).doc();

      // Generate Activity Log
      const { uid } = await this.authService.getUserByEmail(
        invitationData.inviteeEmail
      );

      await this.activityService.writeInvitationActivity({
        type: "invite",
        inviteeId: uid,
        teamId: invitationData.teamId,
        invitationId: "",
        userId,
      });

      transaction.set(invitationRef, newInvitation);

      return {
        message: `${invitationData.inviteeEmail} has been successfully invited`,
      };
    });
  }

  // Respond to invitation
  async respond(
    invitationId: string,
    invitationStatus: Partial<InvitationStatus>,
    uid: string
  ) {
    return await db.runTransaction(async (transaction) => {
      const invitationRef = db
        .collection(COLLECTIONS.INVITATIONS)
        .doc(invitationId);
      const userRef = db.collection(COLLECTIONS.USERS).doc(uid);

      const invitationSnapShot = await invitationRef.get();
      const userSnapShot = await userRef.get();

      const savedInvitationData = invitationSnapShot.data() as any;
      const userData = userSnapShot.data() as IUser;

      // Check if invitation document exists
      if (!invitationSnapShot.exists) {
        throw new ApiError("Invitation does not exist", 400);
      }

      // Check if the person sending the request is the invited person with its email
      if (savedInvitationData.inviteeEmail != userData.profile.email) {
        throw new ApiError("Unauthorized", 401);
      }

      // Check if invitation status is valid
      if (
        !["accepted", "rejected"].some(
          (state: string) => state == invitationStatus
        )
      ) {
        throw new ApiError("Invalid status", 401);
      }

      // If it is already accepted
      if (invitationStatus == "accepted") {
        if (savedInvitationData.invitationStatus == "accepted") {
          throw new ApiError("You already accepted the invitation", 400);
        }

        const { teamId } = savedInvitationData;

        // Generate Activity Log
        await this.activityService.writeInvitationActivity({
          type: "accept",
          inviteeId: uid,
          teamId,
          userId: "",
          invitationId: "",
        });

        transaction.update(userRef, { teamId });
      } else if (invitationStatus == "rejected") {
        // If it is already accepted
        if (savedInvitationData.invitationStatus == "rejected") {
          throw new ApiError("You already rejected the invitation", 400);
        }

        const { teamId } = savedInvitationData;

        // Generate Activity Log
        await this.activityService.writeInvitationActivity({
          type: "decline",
          inviteeId: uid,
          teamId,
          invitationId: "",
          userId: "",
        });
      }

      // Update the invitation status, and change user's teamId field accordingly
      transaction.update(invitationRef, {
        invitationStatus,
        updatedAt: new Date().toISOString(),
      });

      return { message: `Invitation ${invitationStatus} successfully` };
    });
  }

  // Cancel an Invitation
  async cancelInvitation(userId: string, invitationId: string): Promise<void> {
    const invitationRef = db
      .collection(COLLECTIONS.INVITATIONS)
      .doc(invitationId);
    const invitationSnap = await invitationRef.get();

    if (!invitationSnap.exists) {
      throw new ApiError("Invitation not found", 400);
    }

    // team id on invitation doc
    const { teamId: teamInvitationId, invitationStatus } =
      invitationSnap.data() as IInvitation;

    // team id from user doc
    const { teamId, role } = await this.authService.getUserById(userId);

    // Check for authorization
    if (teamId != teamInvitationId && role != "admin") {
      throw new ApiError("Unauthorized to perform this action", 401);
    }

    // Check if the invitation status is `pending`
    if (invitationStatus != "pending") {
      throw new ApiError(
        `This invitation has already been ${invitationStatus}`,
        400
      );
    }

    // Generate Activity Log
    await this.activityService.writeInvitationActivity({
      type: "cancel",
      teamId,
      invitationId,
      inviteeId: "",
      userId,
    });

    invitationRef.update({ status: "inactive" as InvitationDocStatus });
  }

  /**
   *
   * @param memberEmail
   *  Team Information
   * Invitation Information
   */
  async myInvitations(memberEmail: string) {
    return db.runTransaction(async (transaction) => {
      logger.info(`Fetching ${memberEmail} invitations.`);

      // Fetch all invitations for `memberEmail`
      const invitationsQuery = db
        .collection(COLLECTIONS.INVITATIONS)
        .where("inviteeEmail", "==", memberEmail)
        .where("invitationStatus", "==", "pending");

      const invitationsRef = await transaction.get(invitationsQuery);
      const total = invitationsRef.size;

      logger.info(`Total Invitations: ${total}`);

      if (total === 0) {
        return { total: 0, data: { invitation: null, team: null } };
      }

      const data = [];

      for (const invitationDoc of invitationsRef.docs) {
        // Fetch the team data related to the invitation
        const teamId = invitationDoc.data().teamId;
        const teamDetailInfo = await this.teamService.getTeamDetail(teamId);

        // Clean up some keys from object
        const invitationData = invitationDoc.data();
        delete invitationData.inviteeEmail;
        delete invitationData.teamId;
        delete invitationData.createdAt;

        data.push({
          id: invitationDoc.id,
          ...invitationData,
          team: teamDetailInfo,
        });
      }

      logger.info("Fetched invitation data successfully");
      return { total, data };
    });
  }
}
