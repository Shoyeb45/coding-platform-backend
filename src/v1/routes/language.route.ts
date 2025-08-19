import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZLanguageCreate } from "../types/programmingLanguage.type";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { LanguageController } from "../controllers/language.controller";

const router = Router();

router.route("/")
    .post(authenticateUser, validate(ZLanguageCreate), asyncHandler(LanguageController.createLanguage))
    .get(asyncHandler(LanguageController.getAllLanguages));
export default router;