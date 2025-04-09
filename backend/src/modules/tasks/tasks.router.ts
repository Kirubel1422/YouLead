import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import validate from "src/validators/validate";
import { TaskSchema } from "src/validators/task.validator";
import { TaskController } from "./tasks.controller";

const router = Router();
const taskController = new TaskController();

router.post(
  "/create",
  authMiddlewares.validateTeamLeader,
  validate(TaskSchema),
  taskController.createTask
);
router.post(
  "/assign/:taskId",
  authMiddlewares.validateTeamLeader,
  taskController.assignMembers
);
router.put(
  "/unassign/:taskId",
  authMiddlewares.validateTeamLeader,
  taskController.unAssign
);

router.put(
  "/deadline/:taskId",
  authMiddlewares.validateTeamLeader,
  taskController.mutateDeadline
);
router.put(
  "/complete/:taskId",
  authMiddlewares.validate,
  taskController.markAsComplete
);
router.delete(
  "/delete/:taskId",
  authMiddlewares.validateTeamLeader,
  taskController.deleteTask
);

router.get("/my", authMiddlewares.validate, taskController.fetchMyTasks);

export default router;
