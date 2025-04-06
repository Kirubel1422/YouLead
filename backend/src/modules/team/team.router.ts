import { Router } from "express";
import { TeamController } from "./team.controller";
import { CreateTeamSchema } from "src/validators/team.validator";
import { authMiddlewares } from "../auth/auth.middleware";
import validate from "src/validators/validate";

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
router.put("/leave", authMiddlewares.validate, teamController.leaveTeam);
router.put("/join", authMiddlewares.validate, teamController.joinTeamById);

export default router;
