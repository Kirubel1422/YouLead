import { Request, Response, NextFunction } from "express";
import { TeamService } from "./team.service";

export class TeamController {
  private teamService: TeamService;
  constructor() {
    this.teamService = new TeamService();
    this.createTeam.bind(this);
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      await this.teamService.createTeam(req.body);
    } catch (error) {
      next(error);
    }
  }
}
