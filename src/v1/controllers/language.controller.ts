import {  Request, Response } from "express";
import { LanguageService } from "../services/language.service";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";

export class LanguageController {
    static createLanguage = async (req: Request, res: Response) => {
        const language = await LanguageService.createLanguage(req.user, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully created new language", { language })
        )
    }

    static getAllLanguages = async (req: Request, res: Response) => {
        const languages = await LanguageService.getAllLanguages();
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully created new language", { languages })
        )
    }
}