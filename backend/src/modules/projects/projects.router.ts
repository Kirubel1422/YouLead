import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { ProjectController } from "./projects.controller";
import validate from "src/validators/validate";
import {
  ProjectAddMembersSchema,
  ProjectSchema,
} from "src/validators/project.validator";

const router = Router();
const projectController = new ProjectController();

router.get("/my", authMiddlewares.validate, projectController.getMyProjects);

router.get(
  "/members/:projectId",
  authMiddlewares.validate,
  projectController.getProjectMembers
);

router.post(
  "/create",
  authMiddlewares.validateTeamLeader,
  validate(ProjectSchema),
  projectController.createProject
);

router.post(
  "/addMembers/:projectId",
  authMiddlewares.validateTeamLeader,
  validate(ProjectAddMembersSchema),
  projectController.addMembers
);

router.put(
  "/remove/:projectId",
  authMiddlewares.validateTeamLeader,
  projectController.removeMember
);

router.put(
  "/deadline/:projectId",
  authMiddlewares.validateTeamLeader,
  projectController.mutateDeadline
);

router.put(
  "/complete/:projectId",
  authMiddlewares.validate,
  projectController.markAsComplete
);

router.delete(
  "/delete/:projectId",
  authMiddlewares.validateTeamLeader,
  projectController.deleteProject
);
router.get("/my", authMiddlewares.validate, projectController.my);

router.get("/:id", authMiddlewares.validate, projectController.getProjectById);

router.put(
  "/edit/:projectId",
  authMiddlewares.validateTeamLeader,
  validate(ProjectSchema),
  projectController.updateProject
);
export default router;
