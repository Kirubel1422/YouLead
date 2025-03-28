import dotenv from "dotenv";
import { errorHandler } from "./utils/error/error.middleware";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ENV } from "src/constants/dotenv";
import loggerMiddleware from "./utils/logger/logger.middleware";
import "./configs/firebase";
import appRoutes from "./modules/index.routes";
import { ApiError } from "./utils/api/api.response";

const app = express();

app.use(express.json());
app.use(cors());
app.use(loggerMiddleware);
app.use(cookieParser(ENV.APP_COOKIE_SECRET));

app.use("/api", appRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(req, res, next, err);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  throw new ApiError("Route not found", 404, false);
});

app.listen(ENV.APP_PORT, () => console.log("Listening on PORT", ENV.APP_PORT));
