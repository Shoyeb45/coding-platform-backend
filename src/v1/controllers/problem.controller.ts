import { NextFunction, Request, Response } from "express";
import { ProblemService } from "../services/problem.service";
import { logger } from "../../utils/logger";
import { ZProblemFilter } from "../types/problem.type";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";

export class ProblemController {
    static createProblem = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("Requesting to create a new problem, title: " + req.body.title);
        const data = req.body;
        await ProblemService.createProblem(data, res);
        next();
    }

    static updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("Request came for partially updating the problem statement.");
        const id = req.params.id;
        await ProblemService.updateProblem(id, req.body, res);
        next();
    }

    static getTagsOfProblem = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await ProblemService.getTagsOfProblem(id, res);
        next();
    }

    static getProblemById = async (req: Request, res: Response, next: NextFunction) => {

        const id = req.params.id;

        await ProblemService.getProblemById(id, res);
        next();
    }

    static getAllProblems = async (req: Request, res: Response, next: NextFunction) => {
        const parsedData = ZProblemFilter.safeParse(req.query);
        await ProblemService.getAllProblems(parsedData, res);
        next();
    }

    static getAllProblemsOfCreator = async (req: Request, res: Response, next: NextFunction) => {

        const creatorId = req.query.creatorId as string;
        await ProblemService.getProblemsOfCreator(creatorId, res);

        res.status(res.locals.statusCode).json({
            success: res.locals.success,
            message: res.locals.message,
            data: res.locals.data
        });
        return;
    }

    static removeProblem = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await ProblemService.removeProblem(id, res);
    }

    static addModeratorsToProblem = async (req: Request, res: Response, next: NextFunction) => {
        await ProblemService.addModeratorsToProblem(req.body, res);
    }

    static getModeratorsOfProblem = async (req: Request, res: Response, next: NextFunction) => {
        await ProblemService.getModeratorsOfProblem(req.params.problemId, res);
    }

    static addDriverCode = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const data = await ProblemService.addDriverCode(problemId, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully added driver code for given problem", data)
        )
    }
    
    static getDriverCodes = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const data = await ProblemService.getDriverCodes(problemId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched driver code for given problem.", data)
        )
    }
    
    static updateDriverCode = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const data = await ProblemService.updateDriverCode(problemId, req.body);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully updated driver code for given problem.", data)
        );
    }
}