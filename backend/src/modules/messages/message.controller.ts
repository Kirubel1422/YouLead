import { NextFunction, Request, Response } from "express";
import { MessageService } from "./message.service";
import { ApiResp } from "src/utils/api/api.response";

export class MessageController {
  private msgService: MessageService;
  constructor() {
    this.fetchMessages = this.fetchMessages.bind(this);

    this.msgService = new MessageService();
  }

  async fetchMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const DMs = await this.msgService.fetchDM(req.user.uid);
      res.json(new ApiResp("Messages fetched successfully", 200, true, DMs));
    } catch (error) {
      next(error);
    }
  }
}
