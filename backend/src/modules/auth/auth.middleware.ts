import { NextFunction, Response, Request } from "express";
import { cookieConfig } from "src/configs/cookie";
import { auth } from "src/configs/firebase";
import { ApiError } from "src/utils/api/api.response";

export const authMiddlewares = {
  isAdmin: async () => null,
  validate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.cookies;
      const decodedToken = await auth.verifyIdToken(token);

      if (!decodedToken) {
        throw new ApiError("Invalid token", 401, false);
      }

      req.user = decodedToken;
    } catch (error) {
      res.clearCookie("token", { ...cookieConfig, maxAge: 0 });
      next(error);
    }
  },
};
