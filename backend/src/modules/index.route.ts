import { Router } from "express";
import authRouter from "./auth/auth.router";
import teamsRouter from "./team/team.router";
import invitationRouter from "./invitation/invitation.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/teams", teamsRouter);
router.use("/invitations", invitationRouter);

export default router;
