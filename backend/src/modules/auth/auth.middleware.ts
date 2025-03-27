import { NextFunction, Response } from "express";
import { cookieConfig } from "src/configs/cookie";
import { auth } from "src/configs/firebase";
import { ApiError } from "src/utils/api/api.response";
import { Request } from "src/types/express";
import { Role } from "src/interfaces/user.interface";

export const authMiddlewares = {
  validateAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.cookies;
      const decodedToken = await auth.verifyIdToken(token);

      if (!decodedToken || (decodedToken.role as Role) != "admin") {
        throw new ApiError("Invalid token", 401, false);
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      next(error);
    }
  },
  validate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.cookies;
      const decodedToken = await auth.verifyIdToken(token);

      if (!decodedToken) {
        throw new ApiError("UnAuthorized", 401, false);
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      res.clearCookie("token", { ...cookieConfig, maxAge: 0 });
      next(error);
    }
  },
  validateTeamLeader: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { token } = req.cookies;
      const decodedToken = await auth.verifyIdToken(token);

      if (
        !decodedToken ||
        !["teamLeader", "admin"].some((role: any) => role == decodedToken.role)
      ) {
        throw new ApiError("UnAuthorized", 401, false);
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      next(error);
    }
  },
};
