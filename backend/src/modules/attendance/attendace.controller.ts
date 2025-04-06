import { NextFunction, Request, Response } from "express";
import { AttendanceService } from "./attendace.service";
import { ApiResp } from "src/utils/api/api.response";

export class AttendaceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
    this.postAttendance = this.postAttendance.bind(this);
  }

  async postAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      await this.attendanceService.postAttendance(req.body, req.user.uid);
      res.status(201).json(new ApiResp("Successfully posted attendance", 201));
    } catch (error) {
      next(error);
    }
  }
}
