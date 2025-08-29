import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiError } from "../../utils/ApiError";
import { LanguageRepository } from "../repositories/language.repository";
import { TLanguageCreate } from "../types/programmingLanguage.type";

export class LanguageService {
    private static authenticateTeacher = (user: Express.Request["user"]) => {
        if (!user?.id) {
            throw new ApiError("No teacher id found");
        }

        if (user.role !== "ASSISTANT_TEACHER" && user.role !== "TEACHER") {
            throw new ApiError("Unauthorized access, only teacher is allowed to modify testcases", HTTP_STATUS.UNAUTHORIZED);
        }
    }

    static createLanguage = async (user: Express.Request["user"], data: TLanguageCreate) => {
        this.authenticateTeacher(user);
        const createdLangauge = await LanguageRepository.create(data);
        if (!createdLangauge) {
            throw new ApiError("Failed to create programming language.");
        }
        
        return createdLangauge;
    }

    static getAllLanguages = async () => {
        const data = await LanguageRepository.getAll();
        return data;
    }
}