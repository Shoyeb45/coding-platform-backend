import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZSubmission } from "../types/submission.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { SubmissionController } from "../controllers/submission.controller";

const router = Router();

router.route("/")
    .post(validate(ZSubmission), asyncHandler(SubmissionController.createSubmission));
export default router;