import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { AnalyticsController } from "./analytics.controller";

const analyticsController = new AnalyticsController();
const router = Router();

router.get("/main", authMiddlewares.validate, analyticsController.getMain);
router.get(
  "/team",
  authMiddlewares.validateTeamLeader,
  analyticsController.getTeamAnalytics
);
router.get(
  "/team/members",
  authMiddlewares.validateTeamLeader,
  analyticsController.getTeamMembersAnalytics
);
export default router;
