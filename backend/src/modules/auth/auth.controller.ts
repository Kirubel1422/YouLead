import { ISignupRequest } from "src/interfaces/auth.interface";
import { AuthServices } from "./auth.service";
import { Request, Response, NextFunction } from "express";
import { cookieConfig } from "src/configs/cookie";
import { ApiResp } from "src/utils/api/api.response";
import logger from "src/utils/logger/logger";
import { ISignin } from "src/interfaces/auth.interface";

export class AuthController {
  private authService: AuthServices;

  constructor() {
    this.authService = new AuthServices();
    this.userSignup = this.userSignup.bind(this);
    this.userSignin = this.userSignin.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.me = this.me.bind(this);
  }

  // For Signup
  async userSignup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, user } = await this.authService.userSignup(
        req.body as ISignupRequest,
        req.ip
      );

      res.cookie("token", token, cookieConfig);
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
      const { token, user } = await this.authService.login(
        req.body as ISignin,
        req.ip
      );
      logger.info("Logged in Successfully!  " + user.profile.email);
      res.cookie("token", token, cookieConfig);
      console.log(token);
      res.status(200).json(new ApiResp("Login Success", 200, true, user));
    } catch (error: any) {
      next(error);
    }
  }

  // For delete user
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await this.authService.deleteUser(
        req.params.uid,
        req.user.uid,
        req.ip as string
      );
      res.json(new ApiResp("Successfully deleted user!", 200, true));
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = await this.authService.me(req.user.uid);
      res
        .status(200)
        .json(
          new ApiResp("Successfully fetched user data.", 200, true, userData)
        );
    } catch (error) {
      next(error);
    }
  }
}
