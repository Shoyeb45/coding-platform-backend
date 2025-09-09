import { NextFunction, Request, Response } from "express";
import { ProblemService } from "../services/problem.service";
import { logger } from "../../utils/logger";
import { ZProblemFilter } from "../types/problem.type";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

export class ProblemController {
    static createProblem = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("Requesting to create a new problem, title: " + req.body.title);
        const data = req.body;
        data.createdBy = req.user?.id;

        if (req.user?.role !== "TEACHER" && req.user?.role !== "ASSISTANT_TEACHER") {
            throw new ApiError("Unauthorised access, only teacher or assistant teacher is allowed to create a question");
        }

        await ProblemService.createProblem(data, res);
        next();
    }

    static updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
        logger.info("Request came for partially updating the problem statement.");
        if (req.user?.role !== "ASSISTANT_TEACHER" && req.user?.role !== "TEACHER") {
            throw new ApiError("Only teacher can add moderators to the problem", HTTP_STATUS.UNAUTHORIZED);
        }
        const id = req.params.id;
        await ProblemService.updateProblem(req.user?.id, id, req.body, res);
        next();
    }

    static getTagsOfProblem = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        await ProblemService.getTagsOfProblem(id, res);
        next();
    }

    static getProblemById = async (req: Request, res: Response, next: NextFunction) => {

        const id = req.params.id;

        await ProblemService.getProblemById(req.user?.id, id, res);
        next();
    }

    static getAllProblems = async (req: Request, res: Response, next: NextFunction) => {
        const parsedData = ZProblemFilter.safeParse(req.query);
        if (req.user && req.user.role !== "TEACHER" && req.user.role !== "ASSISTANT_TEACHER") {
            throw new ApiError("Only teacher is allowed to see all the problems.", HTTP_STATUS.UNAUTHORIZED);
        }
        await ProblemService.getAllProblems(req.user?.id, parsedData, res);
        next();
    }


    static deleteModeratorFromProblem = async (req: Request, res: Response) => {
        const id = req.params.id;
        const deletedModerator = await ProblemService.deleteModeratorFromProblem(req.user, id);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully deleted the problem.", { deletedModerator })
        );
    }

    static getProblemDetails = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const data = await ProblemService.getProblemDetails(problemId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched details of the problem.", data)
        );
    }
    static getAllProblemsOfCreator = async (req: Request, res: Response) => {

        const creatorId = req.user?.id;
        await ProblemService.getProblemsOfCreator(creatorId, res);

        res.status(res.locals.statusCode).json({
            success: res.locals.success,
            message: res.locals.message,
            data: res.locals.data
        });
        return;
    }

    static removeProblem = async (req: Request, res: Response) => {
        if (req.user?.role !== "ASSISTANT_TEACHER" && req.user?.role !== "TEACHER") {
            throw new ApiError("Only teacher can add moderators to the problem", HTTP_STATUS.UNAUTHORIZED);
        }
        const id = req.params.id;
        await ProblemService.removeProblem(req.user?.id, id, res);
    }

    static addModeratorsToProblem = async (req: Request, res: Response) => {
        if (req.user?.role !== "ASSISTANT_TEACHER" && req.user?.role !== "TEACHER") {
            throw new ApiError("Only teacher can add moderators to the problem", HTTP_STATUS.UNAUTHORIZED);
        }
        await ProblemService.addModeratorsToProblem(req.user?.id, req.body, res);
    }

 
    static getModeratorsOfProblem = async (req: Request, res: Response) => {
        await ProblemService.getModeratorsOfProblem(req.params.problemId, res);
    }

    static addDriverCode = async (req: Request, res: Response) => {
        logger.info(req.user?.role)
        if (req.user?.role !== "ASSISTANT_TEACHER" && req.user?.role !== "TEACHER") {
            throw new ApiError("Only teacher can add moderators to the problem", HTTP_STATUS.UNAUTHORIZED);
        }
        const problemId = req.params.problemId;
        const data = await ProblemService.addDriverCode(req.user?.id, problemId, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully added driver code for given problem", data)
        )
    }

    static getDriverCodes = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const languageId = req.query.languageId as string;
        const data = await ProblemService.getDriverCodes(problemId, languageId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched driver code for given problem.", data)
        )
    }

    static deleteDriverCode = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const id = req.query.id as string;

        const deletedDriverCodes = await ProblemService.deleteDriverCodes(req.user, problemId, id); 

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully removed driver codes.", { deletedDriverCodes })
        );
    }
    static updateDriverCode = async (req: Request, res: Response) => {
        if (req.user?.role !== "ASSISTANT_TEACHER" && req.user?.role !== "TEACHER") {
            throw new ApiError("Only teacher can add moderators to the problem", HTTP_STATUS.UNAUTHORIZED);
        }
        const id = req.params.id;
        const data = await ProblemService.updateDriverCode(req.user?.id, id, req.body);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully updated driver code for given problem.", data)
        );
    }
}