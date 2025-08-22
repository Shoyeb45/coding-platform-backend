import { Response } from "express";
import { TProblem, TProblemCreate, TProblemDriver, TProblemDriverUpdate, TProblemFilter, TProblemModerator, TProblemUpdate } from "../types/problem.type";
import { ApiError } from "../../utils/ApiError";
import { ProblemRepository } from "../repositories/problem.repository";
import { logger } from "../../utils/logger";
import { ApiResponse } from "../../utils/ApiResponse";
import { ZodSafeParseResult } from "zod";
import { HTTP_STATUS } from "../../config/httpCodes";
import { cleanObject, convertToBase64, convertToNormalString } from "../../utils/helper";
import { TestcaseRepository } from "../repositories/testcase.repository";
import { S3Service } from "../../utils/s3client";

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

    static updateProblem = async (teacherId: string | undefined, id: string, data: TProblem, res: Response) => {
        {
            const existingProblem = await ProblemRepository.getProblemById(id);
            if (!existingProblem) {
                throw new ApiError("No problem found with given id", 404);
            }
            if (existingProblem.creator && existingProblem.creator.id !== teacherId) {
                throw new ApiError("User is not authorized to edit the problem, problem owner mismatch.", HTTP_STATUS.UNAUTHORIZED);
            }

        }
        const { tags, ...problemData } = cleanObject(data);

        const updatedProblem = await ProblemRepository.updateProblem(id, problemData);
        if (tags) {
            await ProblemRepository.addTags(id, tags);
        }
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
    static getProblemById = async (teacherId: string | undefined, id: string, res: Response) => {
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


    static getProblemDetails = async (problemId: string) => {
        if (!problemId) {
            throw new ApiError("No problem id found", HTTP_STATUS.BAD_REQUEST);
        }

        const problemDetail = await ProblemRepository.getProblemDetails(problemId);

        if (!problemDetail) {
            throw new ApiError("No problem found with given id");
        }
        problemDetail.problemLanguage = problemDetail.problemLanguage.map((pl) => ({...pl, boilerplate: convertToNormalString(pl.boilerplate)}));

        let testcases = await TestcaseRepository.getTestcases({ problemId, isSample: true });

        if (!testcases) {
            throw new ApiError("Failed to fetch sample testcases from database.");
        }

        const data = await Promise.all(
            testcases.map(async (testcase) => ({
                ...testcase,
                input: await S3Service.getInstance().getFileContent(testcase.input),
                output: await S3Service.getInstance().getFileContent(testcase.output),
            }))
        );

        return {
            problemDetail,
            sampleTestcases: data
        };
    }
    static getAllProblems = async (teacherId: string | undefined, parsedData: ZodSafeParseResult<TProblemFilter>, res: Response) => {
        if (!teacherId) {
            throw new ApiError("Teacher id not found", HTTP_STATUS.UNAUTHORIZED);
        }
        

        if (!parsedData.success) {
            logger.error(parsedData.error)
            throw new ApiError("Failed to parse query string", 500);
        }

        const problems = await ProblemRepository.getAllProblems(parsedData.data);
        const updated = problems.map(problem => ({ isOwner: problem?.creator?.id === teacherId, ...problem }));
        res.locals.data = { problems: updated };
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

    static removeProblem = async (teacherId: string | undefined, id: string, res: Response) => {
        if (!teacherId) {
            throw new ApiError("Teacher id not found", HTTP_STATUS.UNAUTHORIZED);
        }

        if (!id) {
            throw new ApiError("Couldn't find id of the problem to be removed.", 500);
        }
        {
            const existingProblem = await ProblemRepository.getProblemById(id);
            if (!existingProblem) {
                throw new ApiError("No problem found with given id");
            }
            if (existingProblem.creator?.id !== teacherId) {
                throw new ApiError("Unauthorized access, you don't have access to delete the problem.", HTTP_STATUS.UNAUTHORIZED);
            }
        }
        const problem = await ProblemRepository.softRemove(id);
        if (!problem) {
            throw new ApiError("Failed to remove the problem", 500);
        }

        res.status(201).json(
            new ApiResponse(`Problem with id ${id} removed successfully`, { problem })
        );
    }

    static deleteModeratorFromProblem = async (user: Express.Request["user"], id: string) => {
        if (user?.role !== "TEACHER" && user?.role !== "ASSISTANT_TEACHER") {
            throw new ApiError("Only teacher can remove the moderator.");
        }
        {
            const existing = await ProblemRepository.getModerator(id);
            if (!existing) {
                throw new ApiError("No moderator exist with given id.");
            }
            if (existing.problem.createdBy !== user?.id) {
                throw new ApiError("Unauthorized access, you are not allowed to remove the moderator.");
            }
        }
        const data = await ProblemRepository.deleteModerator(id);
        if (!data) {
            throw new ApiError("Failed to remove the moderator.");
        }

        return data;
    }
    private static authenticateModerator = async (teacherId: string, problemId: string) => {
        const mods = await ProblemRepository.getModerators(problemId);

        for (const mod of mods) {
            if (mod.moderator.id === teacherId) {
                return true;
            }
        }
        return false;
    }

    static deleteDriverCodes = async (user: Express.Request["user"], problemId: string, id: string) => {
        if (!problemId) {
            throw new ApiError("No problem id found", HTTP_STATUS.BAD_REQUEST);
        }
        if (!user?.id) {
            throw new ApiError("No teacher id found");
        }

        if (user.role !== "TEACHER" && user.role !== "ASSISTANT_TEACHER") {
            throw new ApiError("Unauthorized access, your are not allowed to perform changes.");
        }
        await this.checkProblem(problemId, user?.id);
        await this.authenticateModerator(user?.id, problemId);

        const data = await ProblemRepository.deleteDriverCodes(id);
        if (!data) {
            throw new ApiError("Failed to delete driver codes");
        }
        data.driverCode = convertToNormalString(data.driverCode);
        data.prelude = convertToNormalString(data.prelude);
        data.boilerplate = convertToNormalString(data.boilerplate);
        return data;
    }
    static addModeratorsToProblem = async (teacherId: string | undefined, data: TProblemModerator, res: Response) => {
        if (!teacherId) {
            throw new ApiError("Teacher id not found.", HTTP_STATUS.UNAUTHORIZED);
        }
        await this.checkProblem(data.problemId, teacherId);
        const moderator = await ProblemRepository.addModerators(data);
        if (!moderator) {
            throw new ApiError("Failed to assign moderator to the problem", 500);
        }

        const moderators = await ProblemRepository.getModerators(data.problemId);

        const mods = moderators.map(mod => ({ moderatorId: mod.id, ...mod.moderator }));
        res.status(201).json(
            new ApiResponse(`Moderator added successfully.`, { moderators: mods })
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
        const moderators = rawData.map(mod => ({ moderatorId: mod.id, ...mod.moderator }));

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all moderators.", { moderators })
        )
    }

    private static checkProblem = async (problemId: string, teacherId: string) => {
        const existingProblem = await ProblemRepository.getProblemById(problemId);
        if (!existingProblem) {
            throw new ApiError("No problem found for given id.", HTTP_STATUS.BAD_REQUEST);
        }

        const isModeratorAllowed = await this.authenticateModerator(teacherId, problemId);
        if (existingProblem.creator && (existingProblem.creator.id.trim() !== teacherId.trim() && !isModeratorAllowed)) {
            throw new ApiError("Unauthorized access, only creator or moderator is allowed to add driver codes", HTTP_STATUS.UNAUTHORIZED);
        }
    }

    static addDriverCode = async (teacherId: string | undefined, problemId: string, driverCodeData: TProblemDriver) => {
        if (!teacherId) {
            throw new ApiError("Teacher id not found.", HTTP_STATUS.UNAUTHORIZED);
        }

        if (!problemId) {
            throw new ApiError("Could not found problem Id", HTTP_STATUS.BAD_REQUEST);
        }
        await this.checkProblem(problemId, teacherId);
        const data = await ProblemRepository.addDriverCode(problemId, {
            ...driverCodeData,
            prelude: convertToBase64(driverCodeData.prelude),
            driverCode: convertToBase64(driverCodeData.driverCode),
            boilerplate: convertToBase64(driverCodeData.boilerplate)
        });

        if (!data) {
            throw new ApiError("Failed to create new problem");
        }
        data.driverCode = convertToNormalString(data.driverCode);
        data.prelude = convertToNormalString(data.prelude);
        data.boilerplate = convertToNormalString(data.boilerplate);
        return data;
    }

    static getDriverCodes = async (problemId: string, languageId: string) => {
        if (!problemId) {
            throw new ApiError("Could not found problem Id", HTTP_STATUS.BAD_REQUEST);
        }

        let driverData = { problemId };
        // const data = await ProblemRepository.getDriverCodes(problemId, languageId);
        let data: {
            prelude: string;
            boilerplate: string;
            driverCode: string;
            id: string;
            language: {
                name: string;
                id: string;
            };
        }[];
        if (languageId) {
            data = await ProblemRepository.getDriverCodes({ languageId, problemId });
        } else {
            data = await ProblemRepository.getDriverCodes({ problemId });
        }

        if (!data) {
            throw new ApiError("Failed to find driver codes for the given problem");
        }
        const newData = data.map((d) => ({
            ...d,
            prelude: convertToNormalString(d.prelude),
            boilerplate: convertToNormalString(d.boilerplate),
            driverCode: convertToNormalString(d.driverCode)
        }));


        return newData;
    }

    static updateDriverCode = async (teacherId: string | undefined, id: string, driverCodeData: TProblemDriverUpdate) => {
        if (!teacherId) {
            throw new ApiError("No teacher id found.");
        }
        if (!id) {
            throw new ApiError("Could not found problem Id", HTTP_STATUS.BAD_REQUEST);
        }
        // await this.checkProblem(problemId, teacherId);
        if (driverCodeData.boilerplate) {
            driverCodeData.boilerplate = convertToBase64(driverCodeData.boilerplate);
        }
        if (driverCodeData.prelude) {
            driverCodeData.prelude = convertToBase64(driverCodeData.prelude);
        }
        if (driverCodeData.driverCode) {
            driverCodeData.driverCode = convertToBase64(driverCodeData.driverCode);
        }

        const data = await ProblemRepository.updateDriverCode(id, driverCodeData);

        if (!data) {
            throw new ApiError("Failed to update driver codes for the given problem");
        }
        data.driverCode = convertToNormalString(data.driverCode);
        data.prelude = convertToNormalString(data.prelude);
        data.boilerplate = convertToNormalString(data.boilerplate);

        return data;
    }



}