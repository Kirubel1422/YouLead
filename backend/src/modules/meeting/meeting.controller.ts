import { NextFunction, Response, Request } from "express";
import { MeetingService } from "./meeting.service";
import { ApiResp } from "src/utils/api/api.response";

export class MeetingController {
  private meetingService: MeetingService;
  constructor() {
    this.meetingService = new MeetingService();
    this.createMeeting = this.createMeeting.bind(this);
    this.updateMeeting = this.updateMeeting.bind(this);
    this.getMeetingById = this.getMeetingById.bind(this);
    this.addToMeeting = this.addToMeeting.bind(this);
  }

  async createMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      await this.meetingService.createMeeting(
        req.body,
        req.user.uid,
        req.params.teamId
      );
      res
        .status(201)
        .json(new ApiResp("Successfully created meeting.", 201, true, null));
    } catch (error) {
      next(error);
    }
  }

  async updateMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      await this.meetingService.updateMeeting(
        req.params.id,
        req.user.uid,
        req.body
      );

      res.status(200).json(new ApiResp("Successfully updated meeting.", 200));
    } catch (error) {
      next(error);
    }
  }

  async getMeetingById(req: Request, res: Response, next: NextFunction) {
    try {
      const meetingData = await this.meetingService.getMeetingById(
        req.params.id
      );
      res
        .status(200)
        .json(
          new ApiResp(
            "Successfully fetched meeting detail",
            200,
            true,
            meetingData
          )
        );
    } catch (error) {
      next(error);
    }
  }

  async addToMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      await this.meetingService.addMemberToMeeting(
        req.params.memberId,
        req.user.uid,
        req.params.id
      );
    } catch (error) {
      next(error);
    }
  }
}
