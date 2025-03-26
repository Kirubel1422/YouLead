import { CreateTeamSchemaType } from "src/validators/team.validator";

export class TeamService {
  constructor() {
    this.createTeam.bind(this);
  }

  // This is done by only a team leader, so after calling this api the role of
  // the user must be changed accordingly
  async createTeam(body: CreateTeamSchemaType) {}
}
