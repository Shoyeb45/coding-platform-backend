import { NextFunction, Request, Response } from "express";
import { UserRole } from "../types/auth.type";
import { config } from "../config";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";

interface DecodedUserPayload {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    designation?: string;
    phone: string;
    iat: number;
    exp: number;
}


export const verifyJwt = (token: string): DecodedUserPayload => {
    try {
        const decoded = jwt.verify(token, config.jwtAccessSecret) as DecodedUserPayload;
        return decoded;
    } catch (error) {
        logger.error("Failed to verify jwt, error: " + error);
        throw new Error('Invalid or expired token');
    }
};


export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    try {
        let token: string | undefined;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized access, token is missing.",
                errors: [],
                timeStamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        
        const payload = verifyJwt(token);
        
        if (!payload) {
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized access, failed to verify the token.",
                errors: [],
                timeStamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        req.user = {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            phone: payload.phone,
            designation: payload.designation,
        };

        next();
    } catch (error) {
        logger.error("Failed to autheticate user, error: " + error);
        res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Failed to authenticate user",
            errors: [],
            timeStamp: new Date().toISOString(),
            path: req.originalUrl
        })
    }
}