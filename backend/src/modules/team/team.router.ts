import { Router } from "express";
import { TeamController } from "./team.controller";
import validate from "src/validators/validate";
import { CreateTeamSchema } from "src/validators/team.validator";
import { authMiddlewares } from "../auth/auth.middleware";

const router = Router();
const teamController = new TeamController();

router.post(
  "/create",
  authMiddlewares.validateTeamLeader,
  validate(CreateTeamSchema),
  teamController.createTeam
);
router.delete(
  "/delete/:teamId",
  authMiddlewares.validateTeamLeader,
  teamController.deleteTeam
);
export default router;
