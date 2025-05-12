import { NextFunction, Request, Response } from "express";
import { ActivityService } from "./activities.service";
import { ApiResp } from "src/utils/api/api.response";

export class ActivityController {
  private activityService: ActivityService;

  constructor() {
    this.activityService = new ActivityService();

    this.getRecentActivities = this.getRecentActivities.bind(this);
  }

  async getRecentActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await this.activityService.recentActivities(
        req.query.teamId as string
      );

      res
        .status(200)
        .json(
          new ApiResp(
            "Successfully fetched recent activities",
            200,
            true,
            activities
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
