import { Router } from "express";
import authRoutes from "./auth/auth.router";
import teamsRoutes from "./team/team.router";
import invitationRoutes from "./invitation/invitation.router";
import projectRoutes from "./projects/projects.router";
import taskRoutes from "./tasks/tasks.router";
import analyticsRoutes from "./analytics/analytics.router";
import meetingRouter from "./meeting/meeting.router";
import attendanceRouter from "./attendance/attendance.router";
import activityRoutes from "./activities/activities.router";
import calendarRoutes from "./calendar/calendar.router";
import chatRoutes from "./messages/message.router";

const router = Router();

router.use("/auth", authRoutes);
router.use("/teams", teamsRoutes);
router.use("/invitations", invitationRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/meeting", meetingRouter);
router.use("/attendance", attendanceRouter);
router.use("/activities", activityRoutes);
router.use("/calendar", calendarRoutes);
router.use("/chat", chatRoutes);

export default router;
