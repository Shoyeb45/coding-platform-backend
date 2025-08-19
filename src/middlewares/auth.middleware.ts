import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../config/httpCodes";
import { AuthUser, UserRole } from "../types/auth.type";
import { config } from "../config";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

export function verifyJwt(token: string): AuthUser & jwt.JwtPayload {
    return jwt.verify(token, config.jwtSecret) as AuthUser & jwt.JwtPayload;
}

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            throw new ApiError("Missing authentication token.", HTTP_STATUS.UNAUTHORIZED)
        }

        const payload = verifyJwt(token);

        if (!payload) {
            throw new ApiError("User authentication failed.", HTTP_STATUS.UNAUTHORIZED);
        }
        req.user = {
            sub: payload.sub ?? "unknown",
            email: payload.email,
            name: payload.name,
            role: payload.role as UserRole,
            ...(payload.designation !== undefined && { designation: payload.designation })
        };
        next();
    } catch (error) {
        logger.info("Failed to authenticate user");
        throw new ApiError("Failed to authenticate user");
    }
}