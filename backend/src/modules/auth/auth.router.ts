import { Router } from "express";
import { SigninSchema, SignupSchema } from "src/validators/auth.validator";
import validate from "src/validators/validate";
import { AuthController } from "./auth.controller";
import { authMiddlewares } from "./auth.middleware";

const route = Router();
const authController = new AuthController();

route.post("/signup", validate(SignupSchema), authController.userSignup);
route.post("/signin", validate(SigninSchema), authController.userSignin);
route.delete(
  "/delete/:uid",
  authMiddlewares.validateAdmin,
  authController.deleteUser
);

export default route;
