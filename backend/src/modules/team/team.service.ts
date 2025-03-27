import { db } from "src/configs/firebase";
import { COLLECTIONS } from "src/constants/firebase.collections";
import { ApiError } from "src/utils/api/api.response";
import { CreateTeamSchemaType } from "src/validators/team.validator";

export class TeamService {
  constructor() {
    this.createTeam = this.createTeam.bind(this);
  }

  // This is done by only a team leader, so after calling this api the role of
  // the user must be changed accordingly
  async createTeam(body: CreateTeamSchemaType, teamLeaderUID: string) {
    // Check if there is same name
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
    const newTeamRef = await db.collection(COLLECTIONS.TEAMS).add({
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Attach teamId to teamLeader
    await db.collection(COLLECTIONS.USERS).doc(teamLeaderUID).update({
      teamId: newTeamRef.id,
    });
  }

  // Delete team
  async deleteTeam(teamId: string) {
    // Check if there is the team
    const teamRef = await db.collection(COLLECTIONS.TEAMS).doc(teamId);
    const teamSnapshot = await teamRef.get();

    if (!teamSnapshot.exists) {
      throw new ApiError("Team doesnot exist.", 400, false);
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
}
