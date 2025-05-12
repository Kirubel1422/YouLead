import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { CalendarController } from "./calendar.controller";

const router = Router();
const calendarController = new CalendarController();

router.get("/my", authMiddlewares.validate, calendarController.fetchUserEvents);
router.get(
  "/task-prioritization",
  authMiddlewares.validate,
  calendarController.getTaskPrioritizationSuggest
);

export default router;
