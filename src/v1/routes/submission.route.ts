import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZSubmission } from "../types/submission.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { SubmissionController } from "../controllers/submission.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * API Prefix: /api/v1/submissions
 */

/**
 * POST /
 * @description API endpoint to submit the code
 * @body
    {
        problemId: string;
        languageId: string;
        code: string;
        submissionTime: string;
        languageCode: string;  // judge0 code
        contestId?: string | undefined;
    }
 * @returns
 * data: {
 *    submissionId: string
 * }
 */
router.route("/")
    .post(authenticateUser, validate(ZSubmission), asyncHandler(SubmissionController.createSubmission));

/**
 * GET /
 * @description API endpoint to get the result of the submission
 * @param submissionId submission id that you got from hitting POST /
 * @returns
 *  data: {
        status: "Queued" | "Failed" | "Running" | "Done";
        results?: {                     // if status is Running or Done then results will be there
            status: string;
            output: string;
            error?: string;
            time?: number;
            compileError?: string,
            memory?: number;
        }[] | undefined 
    } 
 */
router.route("/active/:submissionId")
    .get(asyncHandler(SubmissionController.getActiveSubmission));
export default router;