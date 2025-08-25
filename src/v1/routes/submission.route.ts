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


/**
 * GET /history/:problemId
 * @description API endpoint to get submissions of particular problem
 * @param problemId id of the problem
 * @returns
"data": {
    "submissions": [
        {
            "id": string,
            "status": "Partially Accepted" | "Accepted",
            "language": { 
                "id": "cmek5u1j80003n5ds1sz09qbz",
                "name": "C++"
            },
            "executionTime": null,
            "submittedAt": "2025-08-20T21:20:28.038Z",
            "code": string,
            "memoryUsed": number
        }
    ]
},
 */
router.route("/history/:problemId")
    .get(authenticateUser, asyncHandler(SubmissionController.getSubmissionHistory));
export default router;