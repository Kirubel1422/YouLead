import { Request, Response, NextFunction } from "express";
import { TeamService } from "./team.service";
import { ApiResp } from "src/utils/api/api.response";

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
    this.createTeam = this.createTeam.bind(this);
    this.deleteTeam = this.deleteTeam.bind(this);
    this.leaveTeam = this.leaveTeam.bind(this);
    this.joinTeamById = this.joinTeamById.bind(this);
    this.removeMemberFromTeam = this.removeMemberFromTeam.bind(this);
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, data } = await this.teamService.createTeam(
        req.body,
        req.user.uid
      );
      res.json(new ApiResp(message, 201, true, data));
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

  // Leave team
  async leaveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const resp = await this.teamService.leaveTeam(req.user.uid);
      res.json(new ApiResp(resp.message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Join team by id
  async joinTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, data } = await this.teamService.joinTeamById(
        req.query.teamId as string,
        req.user.uid
      );
      res.json(new ApiResp(message, 200, true, data));
    } catch (error) {
      next(error);
    }
  }

  // Get team details
  async fetchTeamDetail(req: Request, res: Response, next: NextFunction) {
    try {
      // const teamId = req.query.teamId as string;
    } catch (error) {
      next(error);
    }
  }

  // Remove member from team
  async removeMemberFromTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.query;
      await this.teamService.removeMember(memberId as string, req.user.uid);
    } catch (error) {
      next(error);
    }
  }
}
