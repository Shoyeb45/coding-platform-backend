import { Request, Response } from "express"
import { TContestCreation } from "../types/contest.type";
import { ContestService } from "../services/contest.service";



export class ContestController {

    static createContest = async (req: Request, res: Response): Promise<void> => {
        const contestInfo: TContestCreation = req.body;
        ContestService.create(contestInfo, res);
    }
}