import { Response } from "express";
import { TProblem, TProblemCreate, TProblemDriver, TProblemDriverUpdate, TProblemFilter, TProblemModerator } from "../types/problem.type";
import { ApiError } from "../../utils/ApiError";
import { ProblemRepository } from "../repositories/problem.repository";
import { logger } from "../../utils/logger";
import { ApiResponse } from "../../utils/ApiResponse";
import { ZodSafeParseResult } from "zod";
import { HTTP_STATUS } from "../../config/httpCodes";
import { cleanObject, convertToBase64, convertToNormalString } from "../../utils/helper";
import { TestcaseRepository } from "../repositories/testcase.repository";
import { S3Service } from "../../utils/s3client";

interface AuthResult {
    isCreator: boolean;
    isModerator: boolean;
    hasAccess: boolean;
}

export class ProblemService {
    private static readonly s3Service = S3Service.getInstance();
    
    // Cache for authorization results
    private static authCache = new Map<string, { result: AuthResult; timestamp: number }>();
    private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Validates teacher role authorization
     */
    private static validateTeacherRole(user: Express.Request["user"] | string): string {
        let userId: string;
        let role: string;

        if (typeof user === 'string') {
            userId = user;
            role = 'TEACHER'; // Assume teacher for string IDs (backward compatibility)
        } else {
            if (!user?.role || !["ASSISTANT_TEACHER", "TEACHER"].includes(user.role)) {
                throw new ApiError("Only teachers are allowed to perform this action", HTTP_STATUS.UNAUTHORIZED);
            }
            if (!user?.id) {
                throw new ApiError("Teacher ID not found", HTTP_STATUS.UNAUTHORIZED);
            }
            userId = user.id;
            role = user.role;
        }

        return userId;
    }

    /**
     * Validates required parameters
     */
    private static validateRequired(value: unknown, fieldName: string, statusCode = HTTP_STATUS.BAD_REQUEST): void {
        if (!value || (typeof value === 'string' && !value.trim())) {
            throw new ApiError(`${fieldName} is required`, statusCode);
        }
    }

    /**
     * Checks if problem exists and returns it
     */
    private static async validateProblemExists(problemId: string) {
        const problem = await ProblemRepository.getProblemById(problemId);
        if (!problem) {
            throw new ApiError("No problem found with given id", HTTP_STATUS.NOT_FOUND);
        }
        return problem;
    }

    /**
     * Optimized authorization check with caching
     */
    private static async checkProblemAuthorization(userId: string, problemId: string): Promise<AuthResult> {
        const cacheKey = `${userId}-${problemId}`;
        const cached = this.authCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.result;
        }

        const [problem, moderators] = await Promise.all([
            ProblemRepository.getProblemById(problemId),
            ProblemRepository.getModerators(problemId)
        ]);

        if (!problem) {
            throw new ApiError("Problem not found", HTTP_STATUS.NOT_FOUND);
        }

        const isCreator = problem.creator?.id === userId;
        const isModerator = moderators.some(mod => mod.moderator.id === userId);
        const hasAccess = isCreator || isModerator;

        const result: AuthResult = { isCreator, isModerator, hasAccess };
        this.authCache.set(cacheKey, { result, timestamp: Date.now() });
        
        return result;
    }

    /**
     * Validates problem access and throws error if unauthorized
     */
    private static async validateProblemAccess(userId: string, problemId: string): Promise<void> {
        const auth = await this.checkProblemAuthorization(userId, problemId);
        if (!auth.hasAccess) {
            throw new ApiError("Unauthorized access, you don't have access to this problem", HTTP_STATUS.UNAUTHORIZED);
        }
    }

    /**
     * Validates creator access specifically
     */
    private static async validateCreatorAccess(userId: string, problemId: string): Promise<void> {
        const auth = await this.checkProblemAuthorization(userId, problemId);
        if (!auth.isCreator) {
            throw new ApiError("Unauthorized access, only problem creator can perform this action", HTTP_STATUS.UNAUTHORIZED);
        }
    }

    /**
     * Sets response locals consistently
     */
    private static setResponseSuccess(res: Response, data: any, statusCode: number, message: string): void {
        res.locals.data = data;
        res.locals.success = true;
        res.locals.statusCode = statusCode;
        res.locals.message = message;
    }

    /**
     * Processes testcase data in batches for better performance
     */
    private static async processTestcases(testcases: any[], batchSize = 5) {
        const results = [];
        
        for (let i = 0; i < testcases.length; i += batchSize) {
            const batch = testcases.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (testcase) => ({
                    ...testcase,
                    input: await this.s3Service.getFileContent(testcase.input),
                    output: await this.s3Service.getFileContent(testcase.output),
                }))
            );
            results.push(...batchResults);
        }
        
        return results;
    }

    /**
     * Converts driver code data for storage/retrieval
     */
    private static convertDriverCodeData(data: any, toBase64 = false): any {
        const converter = toBase64 ? convertToBase64 : convertToNormalString;
        
        return {
            ...data,
            ...(data.prelude && { prelude: converter(data.prelude) }),
            ...(data.boilerplate && { boilerplate: converter(data.boilerplate) }),
            ...(data.driverCode && { driverCode: converter(data.driverCode) }),
        };
    }

    /**
     * Clears authorization cache for a problem
     */
    private static clearAuthCache(problemId: string): void {
        for (const [key] of this.authCache) {
            if (key.endsWith(`-${problemId}`)) {
                this.authCache.delete(key);
            }
        }
    }

    static createProblem = async (problemData: TProblemCreate, res: Response) => {
        this.validateRequired(problemData.title, "Problem title");

        const existingProblem = await ProblemRepository.getProblemByTitle(problemData.title);
        if (existingProblem) {
            throw new ApiError("Problem name already exists, please choose another name.", HTTP_STATUS.CONFLICT);
        }

        const createdProblem = await ProblemRepository.create(problemData);
        if (!createdProblem) {
            logger.error("Failed to create new problem");
            throw new ApiError("Failed to create new problem", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        logger.info("Problem created successfully");
        this.setResponseSuccess(res, createdProblem, 201, "Problem created successfully.");
    }

    static updateProblem = async (teacherId: string | undefined, id: string, data: TProblem, res: Response) => {
        const validatedTeacherId = this.validateTeacherRole(teacherId || '');
        this.validateRequired(id, "Problem ID");

        const existingProblem = await this.validateProblemExists(id);
        
        if (existingProblem.creator && existingProblem.creator.id !== validatedTeacherId) {
            throw new ApiError("User is not authorized to edit the problem, problem owner mismatch.", HTTP_STATUS.UNAUTHORIZED);
        }

        const { tags, ...problemData } = cleanObject(data);

        const [updatedProblem] = await Promise.all([
            ProblemRepository.updateProblem(id, problemData),
            tags ? ProblemRepository.addTags(id, tags) : Promise.resolve(null)
        ]);

        this.setResponseSuccess(res, { updatedProblem }, 200, "Problem updated successfully.");
    }

    static getTagsOfProblem = async (id: string, res: Response) => {
        this.validateRequired(id, "Problem ID");
        
        await this.validateProblemExists(id);
        
        const tags = await ProblemRepository.getTags(id);
        const filteredTags = tags.map(tag => ({ ...tag.tag }));
        
        this.setResponseSuccess(res, { tags: filteredTags }, 200, "Successfully found tags of the problem.");
    }

    static getProblemById = async (teacherId: string | undefined, id: string, res: Response) => {
        this.validateRequired(id, "Problem ID");

        const problem = await this.validateProblemExists(id);
        
        this.setResponseSuccess(res, { problem }, 200, "Successfully found problem with given id.");
    }

    static getProblemDetails = async (problemId: string) => {
        this.validateRequired(problemId, "Problem ID");

        const [problemDetail, testcases] = await Promise.all([
            ProblemRepository.getProblemDetails(problemId),
            TestcaseRepository.getTestcases({ problemId, isSample: true })
        ]);

        if (!problemDetail) {
            throw new ApiError("No problem found with given id", HTTP_STATUS.NOT_FOUND);
        }

        if (!testcases) {
            throw new ApiError("Failed to fetch sample testcases from database", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Process boilerplate code
        problemDetail.problemLanguage = problemDetail.problemLanguage.map(pl => ({
            ...pl, 
            boilerplate: convertToNormalString(pl.boilerplate)
        }));

        // Process testcases in batches
        const processedTestcases = await this.processTestcases(testcases);

        return {
            problemDetail: {
                ...problemDetail, 
                problemTags: problemDetail.problemTags.map(pt => ({ ...pt.tag }))
            },
            testcases: processedTestcases
        };
    }

    static getAllProblems = async (teacherId: string | undefined, parsedData: ZodSafeParseResult<TProblemFilter>, res: Response) => {
        const validatedTeacherId = this.validateTeacherRole(teacherId || '');

        if (!parsedData.success) {
            logger.error(parsedData.error);
            throw new ApiError("Failed to parse query string", HTTP_STATUS.BAD_REQUEST);
        }

        const problems = await ProblemRepository.getAllProblems(parsedData.data, validatedTeacherId);
        const updated = problems.map(problem => ({ 
            isOwner: problem?.creator?.id === validatedTeacherId, 
            ...problem 
        }));
        
        this.setResponseSuccess(res, { problems: updated }, 200, "Successfully fetched all the problems.");
    }

    static getProblemsOfCreator = async (creatorId: string | undefined, res: Response) => {
        const validatedCreatorId = this.validateTeacherRole(creatorId || '');

        const problems = await ProblemRepository.getProblemsOfCreator(validatedCreatorId);
        
        this.setResponseSuccess(res, { problems }, 200, "Successfully fetched all the problems for creator.");
    }

    static removeProblem = async (teacherId: string | undefined, id: string, res: Response) => {
        const validatedTeacherId = this.validateTeacherRole(teacherId || '');
        this.validateRequired(id, "Problem ID");

        const existingProblem = await this.validateProblemExists(id);
        
        if (existingProblem.creator?.id !== validatedTeacherId) {
            throw new ApiError("Unauthorized access, you don't have access to delete the problem.", HTTP_STATUS.UNAUTHORIZED);
        }

        const problem = await ProblemRepository.softRemove(id);
        if (!problem) {
            throw new ApiError("Failed to remove the problem", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Clear cache since problem is deleted
        this.clearAuthCache(id);

        res.status(201).json(
            new ApiResponse(`Problem with id ${id} removed successfully`, { problem })
        );
    }

    static deleteModeratorFromProblem = async (user: Express.Request["user"], id: string) => {
        const userId = this.validateTeacherRole(user);
        this.validateRequired(id, "Moderator ID");

        const existing = await ProblemRepository.getModerator(id);
        if (!existing) {
            throw new ApiError("No moderator exists with given id", HTTP_STATUS.NOT_FOUND);
        }
        
        if (existing.problem.createdBy !== userId) {
            throw new ApiError("Unauthorized access, you are not allowed to remove the moderator", HTTP_STATUS.UNAUTHORIZED);
        }

        const data = await ProblemRepository.deleteModerator(id);
        if (!data) {
            throw new ApiError("Failed to remove the moderator", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return data;
    }

    private static authenticateModerator = async (teacherId: string, problemId: string): Promise<boolean> => {
        const auth = await this.checkProblemAuthorization(teacherId, problemId);
        return auth.isModerator;
    }

    static deleteDriverCodes = async (user: Express.Request["user"], problemId: string, id: string) => {
        const userId = this.validateTeacherRole(user);
        this.validateRequired(problemId, "Problem ID");
        this.validateRequired(id, "Driver code ID");

        await this.validateProblemAccess(userId, problemId);

        const data = await ProblemRepository.deleteDriverCodes(id);
        if (!data) {
            throw new ApiError("Failed to delete driver codes", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return this.convertDriverCodeData(data, false);
    }

    static addModeratorsToProblem = async (teacherId: string | undefined, data: TProblemModerator, res: Response) => {
        const validatedTeacherId = this.validateTeacherRole(teacherId || '');
        this.validateRequired(data.problemId, "Problem ID");

        await this.validateCreatorAccess(validatedTeacherId, data.problemId);

        if (data.moderatorIds.some(moderatorId => moderatorId === validatedTeacherId)) {
            throw new ApiError("You can't add yourself as a moderator in the problem.", HTTP_STATUS.BAD_REQUEST);
        }

        const moderator = await ProblemRepository.addModerators(data);
        if (!moderator) {
            throw new ApiError("Failed to assign moderator to the problem", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Clear cache since moderators changed
        this.clearAuthCache(data.problemId);

        const moderators = await ProblemRepository.getModerators(data.problemId);
        const mods = moderators.map(mod => ({ 
            moderatorId: mod.id, 
            ...mod.moderator 
        }));

        res.status(201).json(
            new ApiResponse("Moderator added successfully.", { moderators: mods })
        );
    }

    static getModeratorsOfProblem = async (problemId: string, res: Response) => {
        this.validateRequired(problemId, "Problem ID");

        const rawData = await ProblemRepository.getModerators(problemId);
        if (!rawData) {
            throw new ApiError("Failed to retrieve moderators", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const moderators = rawData.map(mod => ({ 
            moderatorId: mod.id, 
            ...mod.moderator 
        }));

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all moderators.", { moderators })
        );
    }

    private static checkProblem = async (problemId: string, teacherId: string): Promise<void> => {
        await this.validateProblemAccess(teacherId, problemId);
    }

    static addDriverCode = async (teacherId: string | undefined, problemId: string, driverCodeData: TProblemDriver) => {
        const validatedTeacherId = this.validateTeacherRole(teacherId || '');
        this.validateRequired(problemId, "Problem ID");

        await this.checkProblem(problemId, validatedTeacherId);

        const convertedData = this.convertDriverCodeData(driverCodeData, true);
        const data = await ProblemRepository.addDriverCode(problemId, convertedData);

        if (!data) {
            throw new ApiError("Failed to create new problem", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return this.convertDriverCodeData(data, false);
    }

    static getDriverCodes = async (problemId: string, languageId: string) => {
        this.validateRequired(problemId, "Problem ID");

        const queryParams = languageId ? { languageId, problemId } : { problemId };
        const data = await ProblemRepository.getDriverCodes(queryParams);

        if (!data) {
            throw new ApiError("Failed to find driver codes for the given problem", HTTP_STATUS.NOT_FOUND);
        }

        return data.map(d => this.convertDriverCodeData(d, false));
    }

    static updateDriverCode = async (teacherId: string | undefined, id: string, driverCodeData: TProblemDriverUpdate) => {
        const validatedTeacherId = this.validateTeacherRole(teacherId || '');
        this.validateRequired(id, "Driver code ID");

        const convertedData = this.convertDriverCodeData(driverCodeData, true);
        const data = await ProblemRepository.updateDriverCode(id, convertedData);

        if (!data) {
            throw new ApiError("Failed to update driver codes for the given problem", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return this.convertDriverCodeData(data, false);
    }

    /**
     * Cleanup method to clear expired cache entries
     */
    static cleanupCache(): void {
        const now = Date.now();
        for (const [key, value] of this.authCache) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.authCache.delete(key);
            }
        }
    }
}

// Periodic cache cleanup
setInterval(() => {
    ProblemService.cleanupCache();
}, 10 * 60 * 1000); // Every 10 minutes