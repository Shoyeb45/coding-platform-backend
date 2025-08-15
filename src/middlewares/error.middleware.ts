import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {logger} from "../utils/logger";
import { config } from "../config";
import { timeStamp } from "console";
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const statusCode = err.statusCode || 500;
    let message = config.nodeEnv === "PRODUCTION"? "Internal Server Error": err?.message || "Internal server error occurred";

    logger.error(err);

    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: err.errors || [],
      timeStamp: new Date().toISOString(),
      path: req.originalUrl
    });
  };
  