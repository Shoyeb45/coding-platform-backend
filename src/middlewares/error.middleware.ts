import { NextFunction, Request, Response } from "express";
import {logger} from "../utils/logger";
import { config } from "../config";
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const statusCode = err.statusCode || 500;
    const message = config.nodeEnv === "PRODUCTION"? "Internal Server Error": err?.message || "Internal server error occurred";

    logger.error(err);

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: err.errors || [],
      timeStamp: new Date().toISOString(),
      path: req.originalUrl
    });
    return;
  };
  