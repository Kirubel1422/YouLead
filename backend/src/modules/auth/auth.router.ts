import { Router } from "express";
import {
  ChangePasswordSchema,
  SigninSchema,
  SignupSchema,
} from "src/validators/auth.validator";
import validate from "src/validators/validate";
import { AuthController } from "./auth.controller";
import { authMiddlewares } from "./auth.middleware";

const router = Router();
const authController = new AuthController();

router.put(
  "/change-password",
  validate(ChangePasswordSchema),
  authController.changePassword
);
router.post("/signup", validate(SignupSchema), authController.userSignup);
router.post("/signin", validate(SigninSchema), authController.userSignin);
router.delete(
  "/delete/:uid",
  authMiddlewares.validateAdmin,
  authController.deleteUser
);
router.get("/me", authMiddlewares.validate, authController.me);

export default router;
