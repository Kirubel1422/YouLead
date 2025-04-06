import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { MeetingController } from "./meeting.controller";
import validate from "src/validators/validate";
import { meetingSchema } from "src/validators/meeting.validator";

const meetingController = new MeetingController();
const router = Router();

router.post(
  "/create/:teamId",
  validate(meetingSchema),
  authMiddlewares.validateTeamLeader,
  meetingController.createMeeting
);

router.put(
  "/edit/:id",
  validate(meetingSchema),
  authMiddlewares.validateTeamLeader,
  meetingController.updateMeeting
);

router.put(
  "/add/:memberId/meeting/:id",
  authMiddlewares.validateTeamLeader,
  meetingController.addToMeeting
);

router.get("/:id", authMiddlewares.validate, meetingController.getMeetingById);

export default router;
