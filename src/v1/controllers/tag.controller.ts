import { NextFunction, Request, Response } from "express";
import { TagService } from "../services/tag.service";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../config/httpCodes";

export class TagController {
    private static checkAuth = (req: Request) => {
        if (req.user?.role !== "ASSISTANT_TEACHER" && req.user?.role !== "TEACHER") {
            throw new ApiError("Only teacher is allowed to add tags", HTTP_STATUS.UNAUTHORIZED);
        }
    }
    static createTag = async (req: Request, res: Response, next: NextFunction) => {
        this.checkAuth(req);
        await TagService.createTag(req.body, res)
        next();
    }
    static updateTag = async (req: Request, res: Response, next: NextFunction) => {
        this.checkAuth(req);
        const id = req.params.id;
        await TagService.updateTag(id, req.body, res)
        next();
        
    }
    static getAllTag = async (req: Request, res: Response, next: NextFunction) => {
        this.checkAuth(req);
        await TagService.getAllTag(res)
        next();
        
    }
    static deleteTag = async (req: Request, res: Response, next: NextFunction) => {
        this.checkAuth(req);
        const id = req.params.id;
        await TagService.removeTag(id, res);
        next();
    }
    
    static getTagById = async (req: Request, res: Response, next: NextFunction) => {
        this.checkAuth(req);
        const id = req.params.id;
        await TagService.getTagById(id, res);
        next();
    }
}