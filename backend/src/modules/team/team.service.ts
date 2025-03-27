import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { ITeam } from "src/interfaces/team.interface";
import { IUser } from "src/interfaces/user.interface";
import { ApiError } from "src/utils/api/api.response";
import { CreateTeamSchemaType } from "src/validators/team.validator";

export class TeamService {
  constructor() {
    this.createTeam = this.createTeam.bind(this);
    this.deleteTeam = this.deleteTeam.bind(this);
    this.leaveTeam = this.leaveTeam.bind(this);
    this.joinTeamById = this.joinTeamById.bind(this);
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
    } as ITeam;

    const newTeamRef = await db.collection(COLLECTIONS.TEAMS).add(teamData);

    // Attach teamId to teamLeader
    await db.collection(COLLECTIONS.USERS).doc(teamLeaderUID).update({
      teamId: newTeamRef.id,
    });

    return { message: "Team created successfully!", data: teamData };
  }

  // Delete team
  async deleteTeam(teamId: string) {
    // Check if there is the team
    const teamRef = db.collection(COLLECTIONS.TEAMS).doc(teamId);
    const teamSnapshot = await teamRef.get();

    if (!teamSnapshot.exists) {
      throw new ApiError("Team does not exist.", 400, false);
    }

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
}
