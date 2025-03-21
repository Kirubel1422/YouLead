import { NextFunction, Request, Response } from "express";
import logger from "../logger/logger";
import { ApiError, ApiResp } from "../api/api.response";
import { AxiosError } from "axios";

export async function errorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
  error: any
) {
  // Log all errors no matter what
  logger.error(`${error.message}`);

  // Firebase errors
  if (error instanceof AxiosError) {
    const errorType = error.response?.data.error.message;

    if (errorType === "INVALID_LOGIN_CREDENTIALS") {
      return res
        .status(400)
        .json(new ApiResp("Wrong email or password", 400, false, {}));
    }
  }

  // Custom API Error
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      statusCode: error.statusCode,
      success: error.success,
      data: error.data,
    });
  }

  // Unknown error
  return res.send(new ApiError("Internal Server Error", 500, false));
}
