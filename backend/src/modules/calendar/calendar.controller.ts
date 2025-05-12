import { NextFunction, Request, Response } from "express";
import { CalendarService } from "./calendar.service";
import { ApiResp } from "src/utils/api/api.response";

export class CalendarController {
  private calendarService: CalendarService;

  constructor() {
    this.calendarService = new CalendarService();

    this.fetchUserEvents = this.fetchUserEvents.bind(this);
    this.getTaskPrioritizationSuggest =
      this.getTaskPrioritizationSuggest.bind(this);
  }

  async fetchUserEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.calendarService.fetchUserEvents(req.user.uid);
      res
        .status(200)
        .json(
          new ApiResp("Fetched all user events successfully", 200, true, data)
        );
    } catch (error) {
      next(error);
    }
  }

  async getTaskPrioritizationSuggest(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // For SSE
      const results = await this.calendarService.prioritizeTasks(req.user.uid);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of results) {
        res.write(`data: ${JSON.stringify({ text: chunk.text() })}\n\n`);
      }

      res.write(JSON.stringify({ status: "Fulfilled" }));
      res.end();
    } catch (error) {
      next(error);
    }
  }
}
