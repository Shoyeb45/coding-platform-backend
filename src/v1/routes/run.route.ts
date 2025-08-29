import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZCustomRun } from "../types/run.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { RunController } from "../controllers/run.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * API Prefix: /api/v1/run
 */

/**
 * POST /
 * @description API endpoint to run the testcases against sample and custom testcases
 * @body
 *  {
        problemId: string;
        testCases: {
            input: string;
            output: string;
        }[];
        code: string;   // user code
        languageId: string;
        languageCode: string;   // judge0 code
 *  }
 * @returns
 * data: {
 *    runId: string
 * }
 */
router.route("/")
    .post(authenticateUser, validate(ZCustomRun), asyncHandler(RunController.customRun));
    
/**
 * GET /:runId
 * @description To get the result of the custom testcase run
 * @param runId run id that you got from hitting POST /
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
router.route("/:runId")
    .get(asyncHandler(RunController.getRunResult));

export default router;