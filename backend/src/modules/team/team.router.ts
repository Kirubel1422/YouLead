import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { TeamController } from "./team.controller";
import validate from "src/validators/validate";
import { CreateTeamSchema } from "src/validators/team.validator";

const router = Router();
const teamController = new TeamController();

router.post(
  "/create",
  authMiddlewares.validate,
  validate(CreateTeamSchema),
  teamController.createTeam
);
