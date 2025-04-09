import { Router } from "express";
import { SigninSchema, SignupSchema } from "src/validators/auth.validator";
import validate from "src/validators/validate";
import { AuthController } from "./auth.controller";
import { authMiddlewares } from "./auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/signup", validate(SignupSchema), authController.userSignup);
router.post("/signin", validate(SigninSchema), authController.userSignin);
router.delete(
  "/delete/:uid",
  authMiddlewares.validateAdmin,
  authController.deleteUser
);
router.get("/me", authMiddlewares.validate, authController.me);

export default router;
