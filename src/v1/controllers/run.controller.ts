import { NextFunction, Request, Response } from "express";
import { TCustomRun } from "../types/run.type";
import { RunService } from "../services/run.service";

export class RunController {
    static customRun = async (req: Request, res: Response, next: NextFunction) => {
        const data = req.body as TCustomRun;
        const result = await RunService.run(data);
        res.status(200).json({
            result
        })
    }   
}