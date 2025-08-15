// middlewares/success.middleware.ts

import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { logger } from "../utils/logger";

export const successHandler = (req: Request, res: Response, next: NextFunction) => {
    logger.info("Successful request , fomatting response....");
    if (res.locals.success) {

        const message = res.locals.message || "Request successful";

        res.status(res.locals.statusCode || 200).json(
            new ApiResponse(message, res.locals.data)
        );
        return;
    }

    next();
};
