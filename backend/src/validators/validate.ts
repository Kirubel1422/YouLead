import { NextFunction, Request, Response } from "express";
import { ApiError } from "src/utils/api/api.response";
import { AnyZodObject } from "zod";

export default function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      const validationErrors = Array.isArray(error.errors)
        ? error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message,
          }))
        : [];

      const customError = new ApiError(
        "Validation Error",
        400,
        false,
        validationErrors
      );
      next(customError);
    }
  };
}
