import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { ENV } from "src/constants/dotenv";

const app = express();

app.use(cors());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send({
    message: "Welcome!",
  });
});

app.listen(ENV.APP_PORT, () => console.log("Listening on PORT", ENV.APP_PORT));
