import { Request, Response } from "express";
import { SubmissionService } from "../services/submission.service";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";

export class SubmissionController {
    static createSubmission = async (req: Request, res: Response) => {
        const submissionId = await SubmissionService.createSubmission(req.user, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully submitted for code submission.", { submissionId })
        );
    }

    static getActiveSubmission = async (req: Request, res: Response) => {
        const submissionId = req.params.submissionId;
        const data = await SubmissionService.getActiveSubmission(submissionId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched active submission.", data)
        );
    }


    static getSubmissionHistory = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const data = await SubmissionService.getSubmissionHistory(req.user, problemId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all submission history", { submissions: data })
        );
    }
}