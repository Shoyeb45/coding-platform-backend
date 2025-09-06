import { TContest, TContestCreate, TContestMod, TContestProblem, TProblemContestEdit } from "../types/contest.type"
import { ContestRepository } from "../repositories/contest.repository";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../config/httpCodes";
import { cleanObject, convertToNormalString } from "../../utils/helper";
import { TestcaseRepository } from "../repositories/testcase.repository";
import { S3Service } from "../../utils/s3client";
import { StudentRepository } from "../repositories/student.repository";

interface UpdateData {
    batchContests: { batch: { name: string; id: string; } }[];
    title: string; 
    description: string; 
    startTime: Date; 
    endTime: Date;
    tags: { tag: { name: string; id: string; } }[]; 
    id: string;
    allowedLanguages: { language: { name: string; id: string; } }[];
    contestModerators: { moderator: { name: string; id: string; email: string; } }[];
    subject: { name: string; id: string; } | null;
}

interface AuthResult {
    isCreator: boolean;
    isModerator: boolean;
    hasAccess: boolean;
}

export class ContestService {
    private static readonly s3Service = S3Service.getInstance();
    
    // Cache for authorization results to avoid repeated DB calls
    private static authCache = new Map<string, { result: AuthResult; timestamp: number }>();
    private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    /**
     * Validates teacher role authorization
     */
    private static validateTeacherRole(user: Express.Request["user"]): void {
        if (!user?.role || !["ASSISTANT_TEACHER", "TEACHER"].includes(user.role)) {
            throw new ApiError("Only teachers are allowed to modify/create/delete contests.", HTTP_STATUS.UNAUTHORIZED);
        }
        
        if (!user?.id) {
            throw new ApiError("Teacher ID not found", HTTP_STATUS.UNAUTHORIZED);
        }
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
     * Optimized authorization check with caching
     */
    private static async checkContestAuthorization(userId: string, contestId: string): Promise<AuthResult> {
        const cacheKey = `${userId}-${contestId}`;
        const cached = this.authCache.get(cacheKey);
        
        // Return cached result if still valid
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.result;
        }

        // Fetch contest and moderators in parallel
        const [contest, moderators] = await Promise.all([
            ContestRepository.getContestById(contestId),
            ContestRepository.getAllModerators(contestId)
        ]);

        if (!contest) {
            throw new ApiError("Contest not found", HTTP_STATUS.NOT_FOUND);
        }

        const isCreator = contest.creator.id === userId;
        const isModerator = moderators.some(mod => mod.moderator.id === userId);
        const hasAccess = isCreator || isModerator;

        const result: AuthResult = { isCreator, isModerator, hasAccess };
        
        // Cache the result
        this.authCache.set(cacheKey, { result, timestamp: Date.now() });
        
        return result;
    }

    /**
     * Clears authorization cache for a contest
     */
    private static clearAuthCache(contestId: string): void {
        for (const [key] of this.authCache) {
            if (key.endsWith(`-${contestId}`)) {
                this.authCache.delete(key);
            }
        }
    }

    /**
     * Validates contest access and throws error if unauthorized
     */
    private static async validateContestAccess(userId: string, contestId: string): Promise<void> {
        const auth = await this.checkContestAuthorization(userId, contestId);
        if (!auth.hasAccess) {
            throw new ApiError("Unauthorized: You don't have access to this contest", HTTP_STATUS.UNAUTHORIZED);
        }
    }

    /**
     * Validates creator access specifically
     */
    private static async validateCreatorAccess(userId: string, contestId: string): Promise<void> {
        const auth = await this.checkContestAuthorization(userId, contestId);
        if (!auth.isCreator) {
            throw new ApiError("Unauthorized: Only contest creator can perform this action", HTTP_STATUS.UNAUTHORIZED);
        }
    }

    /**
     * Formats contest data consistently
     */
    private static formatContestData(contestData: UpdateData) {
        const { batchContests, contestModerators, tags, allowedLanguages, ...restData } = contestData;

        return {
            ...restData,
            batchContests: batchContests.map(bc => ({ 
                id: bc.batch.id, 
                name: bc.batch.name 
            })),
            contestModerators: contestModerators.map(cm => ({ 
                id: cm.moderator.id, 
                name: cm.moderator.name, 
                email: cm.moderator.email 
            })),
            tags: tags.map(tag => ({ 
                id: tag.tag.id, 
                name: tag.tag.name 
            })),
            allowedLanguages: allowedLanguages.map(al => ({ 
                id: al.language.id, 
                name: al.language.name 
            })),
        };
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

    static async createContest(user: Express.Request["user"], contestInfo: TContestCreate) {
        this.validateTeacherRole(user);
        this.validateRequired(contestInfo.title, "Contest title");

        // Check for existing contest with same title
        const existingContest = await ContestRepository.getByTitle(contestInfo.title);
        if (existingContest) {
            throw new ApiError("Contest with this title already exists", HTTP_STATUS.CONFLICT);
        }

        const createdContest = await ContestRepository.create(user?.id!, contestInfo);
        if (!createdContest) {
            throw new ApiError("Failed to create contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return createdContest;
    }

    static async publishContest(user: Express.Request["user"], contestId: string) {
        this.validateTeacherRole(user);
        this.validateRequired(contestId, "Contest ID");

        const contest = await ContestRepository.getContestById(contestId);
        if (!contest) {
            throw new ApiError("Contest not found", HTTP_STATUS.NOT_FOUND);
        }

        // Only creator can publish
        if (contest.creator.id !== user?.id) {
            throw new ApiError("Only contest creator can publish the contest", HTTP_STATUS.UNAUTHORIZED);
        }

        const now = new Date();
        if (contest.endTime > now) {
            throw new ApiError("Cannot publish contest that hasn't ended yet", HTTP_STATUS.BAD_REQUEST);
        }

        return await ContestRepository.publishContest(contestId, contest.isPublished);
    }

    static async deleteModerator(user: Express.Request["user"], moderatorId: string) {
        this.validateTeacherRole(user);
        this.validateRequired(moderatorId, "Moderator ID");

        const deletedMod = await ContestRepository.deleteModerator(moderatorId);
        if (!deletedMod) {
            throw new ApiError("Failed to remove moderator", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return deletedMod;
    }

    static async getProblemDetailsForContest(contestId: string, problemId: string) {
        this.validateRequired(contestId, "Contest ID");
        this.validateRequired(problemId, "Problem ID");

        const [problemDetail, testcases] = await Promise.all([
            ContestRepository.getProblemDetails(contestId, problemId),
            TestcaseRepository.getTestcases({ problemId, isSample: true })
        ]);

        if (!problemDetail) {
            throw new ApiError("Problem not found", HTTP_STATUS.NOT_FOUND);
        }

        if (!testcases) {
            throw new ApiError("Failed to fetch testcases", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Process boilerplate code
        problemDetail.problemLanguage = problemDetail.problemLanguage.map(pl => ({
            ...pl,
            boilerplate: convertToNormalString(pl.boilerplate)
        }));

        // Process testcases in batches for better performance
        const processedTestcases = await this.processTestcases(testcases);

        return {
            problemDetail: {
                ...problemDetail,
                problemTags: problemDetail.problemTags.map(tag => ({ ...tag.tag }))
            },
            testcases: processedTestcases
        };
    }

    static async deleteProblemFromContest(user: Express.Request["user"], id: string) {
        this.validateTeacherRole(user);
        this.validateRequired(id, "Problem contest ID");

        const deletedProblem = await ContestRepository.deleteProblem(id);
        if (!deletedProblem) {
            throw new ApiError("Failed to remove problem from contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return deletedProblem;
    }

    static async addModerator(user: Express.Request["user"], contestId: string, modData: TContestMod) {
        this.validateTeacherRole(user);
        this.validateRequired(contestId, "Contest ID");
        this.validateRequired(modData.moderatorIds, "Moderator IDs");

        await this.validateContestAccess(user?.id!, contestId);

        // Prevent adding self as moderator
        if (modData.moderatorIds.includes(user?.id!)) {
            throw new ApiError("Cannot add yourself as moderator", HTTP_STATUS.BAD_REQUEST);
        }

        const result = await ContestRepository.addModerators(contestId, modData);
        if (!result) {
            throw new ApiError("Failed to add moderators", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Clear cache since moderators changed
        this.clearAuthCache(contestId);

        const moderators = await ContestRepository.getAllModerators(contestId);
        return moderators.map(mod => ({ 
            moderatorId: mod.id, 
            ...mod.moderator 
        }));
    }

    static async editProblemPointOfContest(user: Express.Request["user"], id: string, data: TProblemContestEdit) {
        this.validateTeacherRole(user);
        this.validateRequired(id, "Problem contest ID");
        this.validateRequired(data.contestId, "Contest ID");

        await this.validateContestAccess(user?.id!, data.contestId);

        const updatedProblemContest = await ContestRepository.updatePointsOfProblem(id, data);
        if (!updatedProblemContest) {
            throw new ApiError("Failed to update problem points", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return updatedProblemContest;
    }

    static async deleteContest(user: Express.Request["user"], contestId: string) {
        this.validateTeacherRole(user);
        this.validateRequired(contestId, "Contest ID");

        await this.validateContestAccess(user?.id!, contestId);

        const deletedContest = await ContestRepository.deleteContest(contestId);
        if (!deletedContest) {
            throw new ApiError("Failed to delete contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Clear cache since contest is deleted
        this.clearAuthCache(contestId);

        return deletedContest;
    }

    static async getAllModerators(user: Express.Request["user"], contestId: string) {
        this.validateTeacherRole(user);
        this.validateRequired(contestId, "Contest ID");

        await this.validateContestAccess(user?.id!, contestId);

        const moderators = await ContestRepository.getAllModerators(contestId);
        return moderators.map(mod => ({ 
            moderatorId: mod.id, 
            ...mod.moderator 
        }));
    }

    static async updateContest(user: Express.Request["user"], contestId: string, contestInfo: TContest) {
        this.validateTeacherRole(user);
        this.validateRequired(contestId, "Contest ID");

        await this.validateContestAccess(user?.id!, contestId);

        const { batches, moderators, topics, languages, ...rest } = contestInfo;
        const data: any = cleanObject(rest);

        // Batch nested updates for better performance
        const nestedUpdates = [];
        
        if (languages?.length) {
            nestedUpdates.push(() => {
                data.allowedLanguages = {
                    deleteMany: {},
                    create: languages.map(lang => ({ languageId: lang }))
                };
            });
        }

        if (moderators?.length) {
            nestedUpdates.push(() => {
                data.contestModerators = {
                    deleteMany: {},
                    create: moderators
                                .filter(mid => mid !== user?.id) 
                                .map(mid => ({ moderatorId: mid }))
                };
            });
        }

        if (batches?.length) {
            nestedUpdates.push(() => {
                data.batchContests = {
                    deleteMany: {},
                    create: batches.map(bid => ({ batchId: bid }))
                };
            });
        }

        if (topics?.length) {
            nestedUpdates.push(() => {
                data.tags = {
                    deleteMany: {},
                    create: topics.map(tid => ({ tagId: tid }))
                };
            });
        }

        // Apply all nested updates
        nestedUpdates.forEach(update => update());

        const updatedContest = await ContestRepository.update(contestId, data);
        if (!updatedContest) {
            throw new ApiError("Failed to update contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Clear cache since contest data changed
        this.clearAuthCache(contestId);

        return this.formatContestData(updatedContest);
    }

    static async getContestById(user: Express.Request["user"], contestId: string) {
        this.validateTeacherRole(user);
        this.validateRequired(contestId, "Contest ID");

        const contest = await ContestRepository.getContestById(contestId);
        if (!contest) {
            throw new ApiError("Contest not found", HTTP_STATUS.NOT_FOUND);
        }

        await this.validateContestAccess(user?.id!, contestId);

        return this.formatContestData(contest);
    }

    static async addProblemToContest(user: Express.Request["user"], contestId: string, data: TContestProblem) {
        this.validateTeacherRole(user);
        this.validateRequired(contestId, "Contest ID");

        await this.validateContestAccess(user?.id!, contestId);

        const addedProblem = await ContestRepository.addProblemToContest(contestId, data);
        if (!addedProblem) {
            throw new ApiError("Failed to add problem to contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return await ContestRepository.getAllProblems(contestId);
    }

    static async getAllProblems(user: Express.Request["user"], contestId: string) {
        this.validateRequired(contestId, "Contest ID");

        const contest = await ContestRepository.getContestById(contestId);
        if (!contest) {
            throw new ApiError("Contest not found", HTTP_STATUS.NOT_FOUND);
        }

        let problems;

        if (user?.role === "STUDENT") {
            const now = new Date();
            // only when the contest is live or ended
            if ((now >= contest.startTime && now <= contest.endTime) || now >= contest.endTime) {
                problems = await StudentRepository.getProblemsOfTheContest(user?.id!, contestId);
                problems = problems.map(problem => (cleanObject({ 
                    ...problem.problem, 
                    submissions: undefined, 
                    point: problem.point,
                    isSolved: problem.problem.submissions.length > 0 
                })));
            } else {
                return {
                    ...this.formatContestData(contest),
                    problems: []
                };
            }
        } else {
            problems = await ContestRepository.getAllProblems(contestId);
        }

        if (!problems) {
            throw new ApiError("Failed to fetch problems", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return {
            ...this.formatContestData(contest),
            problems
        };
    }

    static async getContests(user: Express.Request["user"]) {
        this.validateTeacherRole(user);

        const contests = await ContestRepository.getContestsForUser(user?.id!);
        if (!contests) {
            throw new ApiError("Failed to fetch contests", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return contests.map(contest => ({
            ...contest,
            tags: contest.tags.map(tag => ({ ...tag.tag })),
            allowedLanguages: contest.allowedLanguages.map(lang => ({ ...lang.language }))
        }));
    }

    static async getPastContests(user: Express.Request["user"]) {
        this.validateTeacherRole(user);

        const contests = await ContestRepository.getPastContests(user?.id!);
        if (!contests) {
            throw new ApiError("Failed to fetch past contests", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // Batch participant count queries for better performance
        const participantCounts = await Promise.all(
            contests.map(contest => ContestRepository.getCountOfParticipants(contest.id))
        );

        return contests.map((contest, idx) => ({
            ...cleanObject(contest),
            allowedLanguages: contest.allowedLanguages.map(lang => ({ ...lang.language })),
            tags: contest.tags.map(tag => ({ ...tag.tag })),
            participants: participantCounts[idx]
        }));
    }

    static async getTeacherContestLeaderboard(user: Express.Request["user"], contestId: string) {
        this.validateRequired(contestId, "Contest ID");

        const leaderboard = await ContestRepository.getContestLeaderboardData(contestId);
        if (!leaderboard?.length) {
            throw new ApiError("Failed to fetch leaderboard", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const [leadData] = leaderboard;
        
        return {
            ...leadData,
            totalQuestions: Number(leadData.totalQuestions),
            maximumPossibleScore: Number(leadData.maximumPossibleScore),
            leaderboard: leadData.leaderboard.map((student, idx) => ({
                ...student,
                rank: idx + 1,
                totalScore: Number(student.totalScore)
            }))
        };
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
    ContestService.cleanupCache();
}, 10 * 60 * 1000); // Every 10 minutes