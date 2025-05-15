import { Router } from "express";
import { authMiddlewares } from "../auth/auth.middleware";
import { MessageController } from "./message.controller";

const router = Router();
const msgController = new MessageController();

router.get("/messages", authMiddlewares.validate, msgController.fetchMessages);

export default router;
