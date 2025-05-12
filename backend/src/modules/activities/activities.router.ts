import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { ActivityController } from "./activities.controller";

const router = Router();
const activitiesController = new ActivityController();

router.get(
  "/recent",
  authMiddlewares.validate,
  activitiesController.getRecentActivities
);

export default router;
