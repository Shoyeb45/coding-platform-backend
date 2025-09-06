import {  Request, Response } from "express";
import { TCustomRun } from "../types/run.type";
import { RunService } from "../services/run.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { HTTP_STATUS } from "../../config/httpCodes";

export class RunController {
    static customRun = async (req: Request, res: Response) => {
        const data = req.body as TCustomRun;
        const result = await RunService.run(data);

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Code submitted successfully for running.", { runId: result })
        );
    }   

    static getRunResult = async (req: Request, res: Response) => {
        const runId = req.params.runId;
        const result = await RunService.getResult(runId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Fetched details of custom run", result)
        );
    }
}