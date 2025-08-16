import { Request, Response, NextFunction } from "express";
import type { AsyncFunction } from "../v1/types/asyncRequestFunction";

export const asyncHandler =
    (fn: AsyncFunction) =>
        (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };