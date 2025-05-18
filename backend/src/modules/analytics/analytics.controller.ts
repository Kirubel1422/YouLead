import { ApiResp } from "src/utils/api/api.response";
import { AnalyticsService } from "./analytics.service";
import { Request, Response, NextFunction } from "express";

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.getMain = this.getMain.bind(this);
    this.getTeamAnalytics = this.getTeamAnalytics.bind(this);
    this.getTeamMembersAnalytics = this.getTeamMembersAnalytics.bind(this);
  }

  async getMain(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.analyticsService.getMain(req.user.uid);
      res.json(new ApiResp("Analysis generated successfully", 200, true, data));
    } catch (error) {
      next(error);
    }
  }

  async getTeamMembersAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = await this.analyticsService.teamMembers(req.user.uid);
      res.json(
        new ApiResp("Successfully generated analytics", 200, true, data)
      );
    } catch (error) {
      next(error);
    }
  }

  async getTeamAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.analyticsService.teamAnalytics(req.user.uid);
      res.json(
        new ApiResp("Successfully generated analytics", 200, true, data)
      );
    } catch (error) {
      next(error);
    }
  }
}
