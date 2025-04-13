import { ApiResp } from "src/utils/api/api.response";
import { InvitationService } from "./invitation.service";
import { Request, Response, NextFunction } from "express";
import { InvitationStatus } from "src/interfaces/invitation.interface";

export class InvitationController {
  private invitationService: InvitationService;
  constructor() {
    this.invitationService = new InvitationService();

    this.inviteMember = this.inviteMember.bind(this);
    this.respondInvitation = this.respondInvitation.bind(this);
    this.fetchMyInvitations = this.fetchMyInvitations.bind(this);
    this.cancelInvitation = this.cancelInvitation.bind(this);
  }

  // Invite member to team controller
  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = await this.invitationService.inviteMember(
        req.body,
        req.user.uid
      );
      res.json(new ApiResp(message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Respond to invitation from teamLeader by teamMember
  async respondInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { uid } = req.user;
      const { invitationId, response } = req.params;
      const { message } = await this.invitationService.respond(
        invitationId,
        response as Partial<InvitationStatus>,
        uid
      );

      res.json(new ApiResp(message, 200));
    } catch (error) {
      next(error);
    }
  }

  // Fetch a list of my invitations
  async fetchMyInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, total } = await this.invitationService.myInvitations(
        req.query.email as string
      );
      res.status(200).json({ data, total });
    } catch (error) {
      next(error);
    }
  }

  // Cancel Invitation
  async cancelInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      await this.invitationService.cancelInvitation(
        req.user.uid,
        req.params.id
      );
      res
        .status(200)
        .json(new ApiResp("Invitation cancelled successfully", 200));
    } catch (error) {
      next(error);
    }
  }
}
