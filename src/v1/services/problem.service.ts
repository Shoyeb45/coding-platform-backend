import { Response } from "express";
import { TProblem, TProblemCreate, TProblemFilter, TProblemModerator, TProblemUpdate } from "../types/problem.type";
import { ApiError } from "../../utils/ApiError";
import { ProblemRepository } from "../repositories/problem.repository";
import { logger } from "../../utils/logger";
import { ApiResponse } from "../../utils/ApiResponse";
import { ZodSafeParseResult } from "zod";
import { HTTP_STATUS } from "../../config/httpCodes";

export class ProblemService {
    static createProblem = async (problemData: TProblemCreate, res: Response) => {
        {
            const existingProblem = await ProblemRepository.getProblemByTitle(problemData.title);
            if (existingProblem) {
                throw new ApiError("Problem name already exists, please choose another name.", 500);
            }
        }
        const createdProblem = await ProblemRepository.create(problemData);

        if (!createdProblem) {
            logger.error("Failed to create new problem");
            throw new ApiError("Failed to create new problem", 500);
        }
        logger.info("Problem created successfully")

        res.locals.data = createdProblem;
        res.locals.success = true;
        res.locals.statusCode = 201;
        res.locals.message = "Problem created successfully."
        return;
    }

    static updateProblem = async (id: string, data: TProblem, res: Response) => {
        {
            const existingProblem = await ProblemRepository.getProblemById(id);
            if (!existingProblem) {
                throw new ApiError("No problem found with given id", 404);
            }
        }
        const { tags, ...problemData } = data;

        const updatedProblem = await ProblemRepository.updateProblem(id, problemData);
        await ProblemRepository.addTags(id, tags?.split(",") || []);
        res.locals.data = { updatedProblem };
        res.locals.success = true;
        res.locals.statusCode = 200;
        res.locals.message = "Problem updated successfully."
    }

    static getTagsOfProblem = async (id: string, res: Response) => {
        {
            const existingProblem = await ProblemRepository.getProblemById(id);
            if (!existingProblem) {
                throw new ApiError("No problem found with given id", 404);
            }
        }

        const tags = await ProblemRepository.getTags(id);
        const filteredTags = tags.map(tag => ({ ...tag.tag }));
        res.locals.data = { tags: filteredTags };
        res.locals.success = true;
        res.locals.statusCode = 200;
        res.locals.message = "Successfully found tags of the problem."
        return;
    }
    static getProblemById = async (id: string, res: Response) => {
        const problem = await ProblemRepository.getProblemById(id);
        if (!problem) {
            throw new ApiError("No problem found with given id", 404);
        }


        res.locals.data = { problem };
        res.locals.success = true;
        res.locals.statusCode = 200;
        res.locals.message = "Successfully found problem with given id."
        return;
    }

    static getAllProblems = async (parsedData: ZodSafeParseResult<TProblemFilter>, res: Response) => {
        if (!parsedData.success) {
            logger.error(parsedData.error)
            throw new ApiError("Failed to parse query string", 500);
        }
        const problems = await ProblemRepository.getAllProblems(parsedData.data);
        res.locals.data = { problems };
        res.locals.success = true;
        res.locals.statusCode = 200;
        res.locals.message = "Successfully fetched all the problems."
    }

    static getProblemsOfCreator = async (creatorId: string | undefined, res: Response) => {
        
        if (!creatorId) {
            throw new ApiError("Can't find creator id", 500);
        }
        const problems = await ProblemRepository.getProblemsOfCreator(creatorId);
        res.locals.data = { problems };
        res.locals.success = true;
        res.locals.statusCode = 200;
        res.locals.message = "Successfully fetched all the problems for creator."
        
        return;
    }

    static removeProblem = async (id: string, res: Response) => {
        if (!id) {
            throw new ApiError("Couldn't find id of the problem to be removed.", 500);
        }
        const problem = await ProblemRepository.softRemove(id);
        if (!problem) {
            throw new ApiError("Failed to remove the problem", 500);
        }

        res.status(201).json(
            new ApiResponse(`Problem with id ${id} removed successfully`, { problem })
        );
    }

    static addModeratorsToProblem = async (data: TProblemModerator, res: Response) => {
        const moderator = await ProblemRepository.addModerator(data);
        if (!moderator) {
            throw new ApiError("Failed to assign moderator to the problem", 500);
        }

        res.status(201).json(
            new ApiResponse(`Moderator added successfully.`, {  })
        );
    }

    static getModeratorsOfProblem = async (problemId: string, res: Response) => {
        if (!problemId) {
            throw new ApiError("No problem id provided for getting moderator", HTTP_STATUS.NOT_FOUND);
        }
        const rawData = await ProblemRepository.getModerators(problemId);

        if (!rawData) {
            throw new ApiError("Failed to retireve moderators", 500);
        }
        const moderators = rawData.map(mod => ({...mod.moderator}));

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all moderators.", { moderators })
        )
    }
}