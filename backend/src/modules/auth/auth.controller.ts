import { ISignupRequest } from "src/types/api/signup.interface";
import { AuthServices } from "./auth.service";
import { Request, Response, NextFunction } from "express";
import { cookieConfig } from "src/configs/cookie";
import { ApiResp } from "src/utils/api/api.response";
import logger from "src/utils/logger/logger";
import { ISignin } from "src/types/user.interface";

export class AuthController {
  private authService: AuthServices;

  constructor() {
    this.authService = new AuthServices();
    this.userSignup = this.userSignup.bind(this);
    this.userSignin = this.userSignin.bind(this);
  }

  // For Signup
  async userSignup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, user } = await this.authService.userSignup(
        req.body as ISignupRequest
      );

      res.cookie("cookie", token, cookieConfig);
      logger.info("Registeration Compeleted " + user.profile);
      res
        .status(201)
        .json(new ApiResp("Registeration Complete", 201, true, user));
    } catch (error: any) {
      next(error);
    }
  }

  // For Signin
  async userSignin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, user } = await this.authService.login(req.body as ISignin);
      res.cookie("cookie", token, cookieConfig);
      res.status(200).json(new ApiResp("Login Success", 200, true, user));
    } catch (error: any) {
      next(error);
    }
  }
}
