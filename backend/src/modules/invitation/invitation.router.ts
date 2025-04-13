import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { InvitationController } from "./invitation.controller";
import validate from "src/validators/validate";
import { InvitationSchema } from "src/validators/invitation.validator";

const invitationController = new InvitationController();
const router = Router();

router.post(
  "/invite",
  authMiddlewares.validateTeamLeader,
  validate(InvitationSchema),
  invitationController.inviteMember
);
router.post(
  "/respond/:invitationId/:response",
  authMiddlewares.validate,
  invitationController.respondInvitation
);
router.get(
  "/my",
  authMiddlewares.validate,
  invitationController.fetchMyInvitations
);
router.put(
  "/cancel/:id",
  authMiddlewares.validateTeamLeader,
  invitationController.cancelInvitation
);

export default router;
