import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import validate from "src/validators/validate";
import { attendaceSchema } from "src/validators/attendance.validator";
import { AttendaceController } from "./attendace.controller";

const attendanceController = new AttendaceController();
const router = Router();

router.post(
  "/post",
  validate(attendaceSchema),
  authMiddlewares.validateTeamLeader,
  attendanceController.postAttendance
);

export default router;
