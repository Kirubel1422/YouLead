import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import {
  IInvitation,
  InvitationStatus,
} from "src/interfaces/invitation.interface";
import { IUser } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import { InvitationSchemaType } from "src/validators/invitation.validator";

export class InvitationService {
  constructor() {
    this.inviteMember = this.inviteMember.bind(this);
    this.respond = this.respond.bind(this);
  }

  // Invite a person to a team
  async inviteMember(invitationData: InvitationSchemaType) {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        invitationStatus: "pending",
        inviteeLeft: false,
      };

      const invitationRef = db.collection(COLLECTIONS.INVITATIONS).doc();
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

      // If it is already accepted
      if (invitationStatus == "accepted") {
        if (savedInvitationData.invitationStatus == "accepted") {
          throw new ApiError("You already accepted the invitation", 400);
        }

        const { teamId } = savedInvitationData;
        transaction.update(userRef, { teamId });
      }

      // Update the invitation status, and change user's teamId field accordingly
      transaction.update(invitationRef, {
        invitationStatus,
        updatedAt: new Date().toISOString(),
      });

      return { message: `Invitation ${invitationStatus} successfully` };
    });
  }
}
