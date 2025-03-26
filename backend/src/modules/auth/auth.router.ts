import { Router } from "express";
import { SigninSchema, SignupSchema } from "src/validators/auth.validator";
import validate from "src/validators/validate";
import { AuthController } from "./auth.controller";

const route = Router();
const authController = new AuthController();

route.post("/signup", validate(SignupSchema), authController.userSignup);
route.post("/signin", validate(SigninSchema), authController.userSignin);

export default route;
