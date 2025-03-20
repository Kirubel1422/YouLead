import logger from "./logger";
import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
};
