import { Request, Response, NextFunction } from "express";
import { TeamService } from "./team.service";
import { ApiResp } from "src/utils/api/api.response";

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
    this.createTeam = this.createTeam.bind(this);
    this.deleteTeam = this.deleteTeam.bind(this);
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      await this.teamService.createTeam(req.body, req.user.uid);
      res.json(
        new ApiResp("Successfully created team " + req.body.name, 201, true)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete team and update users' teamId field
  async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      await this.teamService.deleteTeam(req.params.teamId);
      res.json(new ApiResp("Successfully deleted team", 200, true));
    } catch (error) {
      next(error);
    }
  }
}
