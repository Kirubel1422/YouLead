import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { ITeam, ITeamDetail } from "src/interfaces/team.interface";
import { IUser } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import logger from "src/utils/logger/logger";
import { CreateTeamSchemaType } from "src/validators/team.validator";
import { AuthServices } from "../auth/auth.service";
import { ActivityService } from "../activities/activities.service";
import { Helper } from "src/utils/helpers";
import { activeUsers } from "src/services/socket";

export class TeamService {
  private activityService: ActivityService;
  private helpers: Helper;

  constructor() {
    this.createTeam = this.createTeam.bind(this);
    this.deleteTeam = this.deleteTeam.bind(this);
    this.leaveTeam = this.leaveTeam.bind(this);
    this.joinTeamById = this.joinTeamById.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.getAllMembers = this.getAllMembers.bind(this);

    this.helpers = new Helper();
    this.activityService = new ActivityService();
  }

  // This is done by only a team leader, so after calling this api the role of
  // the user must be changed accordingly
  async createTeam(body: CreateTeamSchemaType, teamLeaderUID: string) {
    // Check if the user has created a team previously
    const leaderData = (
      await db.collection(COLLECTIONS.USERS).doc(teamLeaderUID).get()
    ).data() as IUser;
    if (leaderData.teamId != "") {
      throw new ApiError("You can only create one team.", 400);
    }

    // Check if there is same team name
    const { name } = body;

    const teamRef = db
      .collection(COLLECTIONS.TEAMS)
      .where("name", "==", name)
      .count(); // Firebase aggregation more efficient
    const teamSnapshot = await teamRef.get(); // {count: 0}

    if (teamSnapshot.data().count > 0) {
      throw new ApiError(
        "Team name exists, please change name.",
        400,
        false,
        null
      );
    }

    // Create team
    const teamData = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teamLeaderId: teamLeaderUID,
    } as ITeam;

    const newTeamRef = await db.collection(COLLECTIONS.TEAMS).add(teamData);

    // Attach teamId to teamLeader
    await db.collection(COLLECTIONS.USERS).doc(teamLeaderUID).update({
      teamId: newTeamRef.id,
    });

    // Write to Activity Log
    await this.activityService.writeTeamActivity({
      email: leaderData.profile.email,
      uid: leaderData.uid,
      teamName: teamData.name,
      type: "create",
    });

    return { message: "Team created successfully!", data: teamData };
  }

  // Delete team
  async deleteTeam(teamId: string, userId: string) {
    // Check if there is the team
    const teamRef = db.collection(COLLECTIONS.TEAMS).doc(teamId);
    const teamSnapshot = await teamRef.get();

    if (!teamSnapshot.exists) {
      throw new ApiError("Team does not exist.", 400, false);
    }

    const teamData = teamSnapshot.data() as ITeam;

    // Find all users that belong to teamId and batch update them
    const usersSnapShot = await db
      .collection(COLLECTIONS.USERS)
      .where("teamId", "==", teamId)
      .get();

    if (!usersSnapShot.empty) {
      const batch = db.batch();

      usersSnapShot.forEach((doc) => {
        batch.update(doc.ref, { teamId: "" });
      });

      await batch.commit();
    }

    // Delete team from teams collections
    await teamRef.delete();

    // Write to Activity Log
    const userDetail = await AuthServices.getUserById(userId);
    await this.activityService.writeTeamActivity({
      email: userDetail.profile.email,
      type: "delete",
      uid: userId,
      teamName: teamData.name,
      teamId,
    });
  }

  // Leave team
  async leaveTeam(uid: string) {
    return await db.runTransaction(async (transaction) => {
      const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
      const userData = (await userRef.get()).data() as IUser;

      // Check if the user has a team
      if (userData.teamId == "") {
        throw new ApiError("Team not found", 400);
      }

      // Clear teamId field from the user
      transaction.update(userRef, { teamId: "" });

      // Find the invitation record and update
      const invitationSnapShot = await db
        .collection(COLLECTIONS.INVITATIONS)
        .where("teamId", "==", userData.teamId)
        .where("inviteeEmail", "==", userData.profile.email)
        .where("inviteeLeft", "==", false)
        .limit(1)
        .get();

      if (!invitationSnapShot.empty) {
        const targetInvitationRef = db
          .collection(COLLECTIONS.INVITATIONS)
          .doc(invitationSnapShot.docs[0].id);
        transaction.update(targetInvitationRef, { inviteeLeft: true });
      }

      return { message: "Left the team successfully!" };
    });
  }

  // Join team by id
  async joinTeamById(teamId: string, uid: string) {
    // Check if team exists
    const teamSnapshot = await db
      .collection(COLLECTIONS.TEAMS)
      .doc(teamId)
      .get();

    if (!teamSnapshot.exists) {
      throw new ApiError("Team does not exist", 400);
    }

    const teamData = teamSnapshot.data() as ITeam;
    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);

    // Set team id field on user
    await userRef.update({ teamId });

    return { message: "Joined team successfully", data: teamData };
  }

  /**
   *
   * @param teamId
   * @returns
   */
  static async getTeamDetail(teamId: string): Promise<Partial<ITeamDetail>> {
    // Fetch the team data related to the invitation
    const teamRef = await db.collection(COLLECTIONS.TEAMS).doc(teamId).get();

    if (!teamRef.exists) {
      logger.warn(`Team not found for teamId: ${teamId}`);
      throw new ApiError(`Invalid team id`, 400, false);
    }

    const { teamLeaderId, name, organization } = teamRef.data() as ITeam;

    const userRef = await db
      .collection(COLLECTIONS.USERS)
      .doc(teamLeaderId)
      .get();
    const userData = userRef.data() as IUser;

    return {
      leader: {
        name: userData.profile.firstName + " " + userData.profile.lastName,
        email: userData.profile.email,
        profilePicture: userData.profile.profilePicture || "",
      },
      id: teamId,
      name,
      organization,
    };
  }

  // Remove member from a team
  async removeMember(memberId: string, leaderId: string): Promise<void> {
    const leaderData = await AuthServices.getUserById(leaderId);
    const memberData = await AuthServices.getUserById(memberId);

    const memberTeamId = memberData.teamId as string;
    const leaderTeamId = leaderData.teamId as string;

    if (memberTeamId != leaderTeamId) {
      throw new ApiError("Unauthorized to perform this action", 401);
    }

    const teamId = memberTeamId; // Either team id can be used since they're same

    if (teamId == "") {
      throw new ApiError("Team not found", 400);
    }

    await db.collection(COLLECTIONS.TEAMS).doc(teamId).delete();

    // Write to Activity Log
    await this.activityService.writeTeamActivity({
      email: leaderData.profile.email,
      uid: leaderId,
      teamId,
      type: "remove-member",
    });
  }

  // Get all members of a team
  /**
   * 
   * @param teamId   {
          id: "user1",
          name: "Alice Johnson",
          avatar: "/placeholder.svg?height=40&width=40",
          initials: "AJ",
          status: "online",
          role: "UI Designer",
     },
   */
  async getAllMembers(teamId: string, uid: string): Promise<any[]> {
    console.log(activeUsers);
    const membersSnap = await db
      .collection(COLLECTIONS.USERS)
      .where("teamId", "==", teamId)
      .get();

    const members = membersSnap.docs.map((doc) => {
      const userData = doc.data() as IUser;
      return {
        id: userData.uid,
        name: userData.profile.firstName + " " + userData.profile.lastName,
        avatar:
          userData.profile.profilePicture ||
          "/placeholder.svg?height=40&width=40",
        initials: this.helpers.getInitials(
          userData.profile.firstName,
          userData.profile.lastName
        ),
        status:
          uid == userData.uid || activeUsers.get(userData.uid)
            ? "online"
            : "offline",
        role: userData.role,
      };
    });

    return members;
  }
}
