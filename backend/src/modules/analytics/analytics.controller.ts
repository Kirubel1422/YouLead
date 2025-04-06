import { ApiResp } from "src/utils/api/api.response";
import { AnalyticsService } from "./analytics.service";
import { Request, Response, NextFunction } from "express";

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.getMain = this.getMain.bind(this);
  }

  async getMain(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.analyticsService.getMain(req.user.uid);
      res.json(new ApiResp("Analysis generated successfully", 200, true, data));
    } catch (error) {
      next(error);
    }
  }
}
