import { Router } from "express";
import authRouter from "./auth/auth.router";
import teamsRouter from "./team/team.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/teams", teamsRouter);

export default router;
