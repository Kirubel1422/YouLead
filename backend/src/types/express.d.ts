// src/types/express.d.ts
import { Request } from "express";

declare module "express" {
  export interface Request {
    user?: any; // Adjust type accordingly
  }
}

export { Request };
