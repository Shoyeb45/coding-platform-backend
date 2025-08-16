import { Response } from "express";
import { TContestCreation } from "../types/contest.type"
import { logger } from "../../utils/logger"


export class ContestService {
    static create = async (contestInfo: TContestCreation, res: Response) => {
        logger.info("Contest creation")
        logger.info(contestInfo);
        res.status(200).json({
            "message": "Creted successfully",
            "success": true,
        })
    }
}