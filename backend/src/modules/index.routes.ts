import { Router } from "express";
import authRoutes from "./auth/auth.router";
import teamsRoutes from "./team/team.router";
import invitationRoutes from "./invitation/invitation.router";
import projectRoutes from "./projects/projects.router";
import taskRoutes from "./tasks/tasks.router";

const router = Router();

router.use("/auth", authRoutes);
router.use("/teams", teamsRoutes);
router.use("/invitations", invitationRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
export default router;
