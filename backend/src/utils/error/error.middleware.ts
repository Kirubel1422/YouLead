import { NextFunction, Request, Response } from "express";
import logger from "../logger/logger";
import { ApiError, ApiResp } from "../api/api.response";
import { AxiosError } from "axios";
import { cookieConfig } from "src/configs/cookie";
import { GoogleGenerativeAIError } from "@google/generative-ai";

export async function errorHandler(
  req: Request,
  res: Response,
  next: NextFunction,
  error: any
) {
  // Log all errors no matter what
  logger.error(`${error}`);

  if (error instanceof GoogleGenerativeAIError) {
    const customError = error as any;
    for (const err of customError.errorDetails) {
      if (err["@type"] == "type.googleapis.com/google.rpc.RetryInfo") {
        return res
          .status(500)
          .json(new ApiError("Please retry after " + err.retryDelay, 500));
      }
    }
    return res.status(500).json(new ApiError("Server is busy.", 500, false));
  }

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

  if (error.code === "auth/id-token-expired") {
    res.clearCookie("token", cookieConfig);
    return res.send(
      new ApiError("Session expired, please login again", 401, false)
    );
  }

  if (error.code == "auth/argument-error") {
    return res.send(new ApiError("Unauthorized", 401, false));
  }

  // Unknown error
  return res.send(new ApiError("Internal Server Error", 500, false));
}
