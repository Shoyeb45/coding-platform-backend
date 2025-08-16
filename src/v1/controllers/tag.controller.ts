import { NextFunction, Request, Response } from "express";
import { TagService } from "../services/tag.service";

export class TagController {
    static createTag = async (req: Request, res: Response, next: NextFunction) => {
        await TagService.createTag(req.body, res)
        next();
    }
    static updateTag = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await TagService.updateTag(id, req.body, res)
        next();
        
    }
    static getAllTag = async (req: Request, res: Response, next: NextFunction) => {
        await TagService.getAllTag(res)
        next();
        
    }
    static deleteTag = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await TagService.removeTag(id, res);
        next();
    }
    
    static getTagById = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await TagService.getTagById(id, res);
        next();
    }
}