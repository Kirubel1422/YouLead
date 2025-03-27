import { Router } from "express";
import authRouter from "./auth/auth.router";
import teamsRouter from "./team/team.router";
import invitationRouter from "./invitation/invitation.router";
import projectRouter from "./projects/projects.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/teams", teamsRouter);
router.use("/invitations", invitationRouter);
router.use("/projects", projectRouter);

export default router;
