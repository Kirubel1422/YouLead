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
import { createServer } from "http";
import initializeSocket from "./services/socket";

const app = express();


// CORS
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

app.use(express.json());

// Handle Socket
const server = createServer(app);
initializeSocket(server);

app.use(express.json());
app.use(loggerMiddleware);

app.use(cookieParser(ENV.APP_COOKIE_SECRET));

app.use("/api", appRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(req, res, next, err);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  throw new ApiError("Route not found", 404, false);
});

server.listen(ENV.APP_PORT, () =>
  console.log("Listening on PORT", ENV.APP_PORT)
);
