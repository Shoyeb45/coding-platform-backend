import { Response } from "express";
import { TContest, TContestCreate, TContestMod, TContestProblem } from "../types/contest.type"
import { logger } from "../../utils/logger"
import { ContestRepository } from "../repositories/contest.repository";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../config/httpCodes";
import { cleanObject } from "../../utils/cleanObject";
import { ProblemRepository } from "../repositories/problem.repository";


export class ContestService {
    private static authenticateTeacher(user: Express.Request["user"]) {
        if (user?.role !== "ASSISTANT_TEACHER" && user?.role !== "TEACHER") {
            throw new ApiError("Only teachers are allowed to modify/create/delete contests.", HTTP_STATUS.UNAUTHORIZED);
        }
    }
    static createContest = async (user: Express.Request["user"], contestInfo: TContestCreate) => {
        {
            const existing = await ContestRepository.getByTitle(contestInfo.title);
            if (existing) {
                throw new ApiError("Title already exist in database, please enter different title");
            }
        }
        // authenticate teacher
        this.authenticateTeacher(user);
        if (!user?.id) {
            throw new ApiError("Teacher id not found");
        }

        const createdContest = await ContestRepository.create(user?.id, contestInfo);
        if (!createdContest) {
            throw new ApiError("Failed to create a new contest, please try again", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        return createdContest;
    }

    private static async authenticateModerator(moderatorId: string | undefined, contestId: string) {
        if (!moderatorId) {
            throw new ApiError("No teacher id found.", HTTP_STATUS.UNAUTHORIZED)
        }
        const mods = await ContestRepository.getAllModerators(contestId);
        for (const mod of mods) {
            if (mod.moderator.id === moderatorId) {
                return true;
            }
        }
        return false;
    }

    private static checkContest = async (teacherId: string | undefined, contestId: string) => {
        const existingContest = await ContestRepository.getContestById(contestId);
        if (!teacherId) {
            throw new ApiError("Teacher id not found");
        }
        if (!existingContest) {
            throw new ApiError("No contest found with given id.", HTTP_STATUS.BAD_REQUEST);
        }

        let teacher = existingContest.creator.id === teacherId;
        let moderator = await this.authenticateModerator(teacherId, contestId);
        return teacher || moderator;
    }

    static publishContest = async (user: Express.Request["user"], contestId: string) => {
        this.authenticateTeacher(user);
        if (!contestId) {
            throw new ApiError("No contest id  found.", HTTP_STATUS.BAD_REQUEST);
        }

        {
            const existingContest = await ContestRepository.getContestById(contestId);
            if (!user?.id) {
                throw new ApiError("Teacher id not found");
            }
            if (!existingContest) {
                throw new ApiError("No contest found with given id.", HTTP_STATUS.BAD_REQUEST);
            }
            const now = new Date(); 
            if (existingContest.endTime > now) {
                throw new ApiError("You can't make contest publish which is not yet done.");
            }
            let teacher = existingContest.creator.id === user.id;
            if (!teacher) {
                throw new ApiError("You are not allowed to make this contest publish.");
            }
        }
        
        const data = await ContestRepository.publishContest(contestId);
        return data;
    }
    static deleteModerator = async (user: Express.Request["user"], moderatorId: string) => {
        this.authenticateTeacher(user);
        if (!moderatorId) {
            throw new ApiError("No moderator id found.", HTTP_STATUS.BAD_REQUEST);
        }
        const deletedMod = await ContestRepository.deleteModerator(moderatorId);
        if (!deletedMod) {
            throw new ApiError("Failed to delete moderator from contest.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        return deletedMod;
    }

    static deleteProblemFromContest = async (user: Express.Request["user"], id: string) => {
        this.authenticateTeacher(user);
        if (!id) {
            throw new ApiError("No problem contest id found", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const deletedProblem = await ContestRepository.deleteProblem(id);

        if (!deletedProblem) {
            throw new ApiError("Failed to delete problem from contest.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }

    static addModerator = async (user: Express.Request["user"], contestId: string, modData: TContestMod) => {
        this.authenticateTeacher(user);
        if (!contestId) {
            throw new ApiError("Contest id not found.", HTTP_STATUS.BAD_REQUEST);
        }

        if (!(await this.checkContest(user?.id, contestId))) {
            throw new ApiError("Unauthorized access, you don't have access to add the moderators to the contest", HTTP_STATUS.UNAUTHORIZED);
        }

        const data = await ContestRepository.addModerators(contestId, modData);
        if (!data) {
            throw new ApiError("Failed to add moderator to the contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const moderators = await ContestRepository.getAllModerators(contestId);
        return moderators.map((mod) => ({ moderatorId: mod.id, ...mod.moderator }));
    }

    static deleteContest = async (user: Express.Request["user"], contestId: string) => {
        this.authenticateTeacher(user);
        if (!contestId) {
            throw new ApiError("Contest id not found.", HTTP_STATUS.BAD_REQUEST);
        }

        if (!(await this.checkContest(user?.id, contestId))) {
            throw new ApiError("Unauthorized access, you don't have access to delete the contest", HTTP_STATUS.UNAUTHORIZED);
        }
        const deletedContest = await ContestRepository.deleteContest(contestId);

        if (!deletedContest) {
            throw new ApiError("Failed to delete the contest.")
        }
        return deletedContest;
    }
    static getAllModerators = async (user: Express.Request["user"], contestId: string) => {
        this.authenticateTeacher(user);

        if (!contestId) {
            throw new ApiError("No contest id found", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        if (!(await this.checkContest(user?.id, contestId))) {
            throw new ApiError("Unauthorized access, you don't have access to see the moderators of the contest", HTTP_STATUS.UNAUTHORIZED);
        }

        const mods = await ContestRepository.getAllModerators(contestId);
        return mods.map(mod => ({ moderatorId: mod.id, ...mod.moderator }))
    }

    static updateContest = async (user: Express.Request["user"], contestId: string, contestInfo: TContest) => {
        this.authenticateTeacher(user);
        if (!contestId) {
            throw new ApiError("No contest id found.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        if (!(await this.checkContest(user?.id, contestId))) {
            throw new ApiError("Unauthorized access, you don't have access to update the contest", HTTP_STATUS.UNAUTHORIZED);
        }

        const { batches, moderators, topics, languages, ...rest } = contestInfo;
        const data: any = cleanObject(rest);

        // Nested updates
        if (languages) {
            // Replace all allowed languages
            data.allowedLanguages = {
                deleteMany: {},  // remove all existing
                create: languages.map(lang => ({ languageId: lang }))
            };
        }

        if (moderators) {
            data.contestModerators = {
                deleteMany: {},
                create: moderators.map(mid => ({ moderatorId: mid }))
            };
        }

        if (batches) {
            data.batchContests = {
                deleteMany: {},
                create: batches.map(bid => ({ batchId: bid }))
            };
        }

        if (topics) {
            data.tags = {
                deleteMany: {},
                create: topics.map(tid => ({ tagId: tid }))
            };
        }

        const updateContestData = await ContestRepository.update(contestId, data);
        // console.log(updateContestData);

        if (!updateContestData) {
            throw new ApiError("Failed to update the contest, please try one more time.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // formatting the data
        const newData = this.formatContestData(updateContestData);
        // const contestData = await ContestRepository.getContestById(contestId);
        return newData;
    }

    private static formatContestData(contestData: UpdateData) {
        const { batchContests, contestModerators, tags, allowedLanguages, ...restData } = contestData;

        // formatting the data
        const newData = {
            ...restData,
            batchContests: batchContests.map(bc => ({ id: bc.batch.id, name: bc.batch.name })),
            contestModerators: contestModerators.map(cm => ({ id: cm.moderator.id, name: cm.moderator.name, email: cm.moderator.email })),
            tags: tags.map(tag => ({ id: tag.tag.id, name: tag.tag.name })),
            allowedLanguages: allowedLanguages.map(al => ({ id: al.language.id, name: al.language.name })),
        }
        return newData;
    }

    static getContestById = async (user: Express.Request["user"], contestId: string) => {
        this.authenticateTeacher(user);
        if (!contestId) {
            throw new ApiError("No contest id found", HTTP_STATUS.BAD_REQUEST);
        }

        const data = await ContestRepository.getContestById(contestId);
        if (!data) {
            throw new ApiError("No contest found with given id.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        {
            let teacher = data.creator.id === user?.id;
            let mod = await this.authenticateModerator(user?.id, contestId);
            if (!(mod || teacher)) {
                throw new ApiError("Unauthorized access, you don't have access to see the contest data.", HTTP_STATUS.UNAUTHORIZED);
            }
        }

        return this.formatContestData(data);
    }

    static addProblemToContest = async (user: Express.Request["user"], contestId: string, data: TContestProblem) => {
        this.authenticateTeacher(user);

        if (!(await this.checkContest(user?.id, contestId))) {
            throw new ApiError("Unauthorized access, you don't have access to add the problem to the contest", HTTP_STATUS.UNAUTHORIZED);
        }

        const addedProblem = await ContestRepository.addProblemToContest(contestId, data);

        if (!addedProblem) {
            new ApiError("Failed to add problem to the contest.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const problems = await ContestRepository.getAllProblems(contestId);
        return problems;
    }

    static getAllProblems = async (contestId: string) => {
        if (!contestId) {
            throw new ApiError("No contest id found to fetch problem.", HTTP_STATUS.BAD_GATEWAY);
        }
        const problems = await ContestRepository.getAllProblems(contestId);

        return problems;
    }

    static getContests = async (user: Express.Request["user"]) => {
        this.authenticateTeacher(user);
        if (!user?.id) {
            throw new ApiError("No teacher id found for getting all the contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        const contests = await ContestRepository.getContestsForUser(user?.id);

        if (!contests) {
            throw new ApiError("Failed to find the contests.");
        }

        return contests.map(contest => ({ ...contest, tags: contest.tags.map(tag => ({ ...tag.tag })), allowedLanguages: contest.allowedLanguages.map((lang) => ({ ...lang.language })) }))
    }

    static getPastContests = async (user: Express.Request["user"]) => {
        this.authenticateTeacher(user);
        if (!user?.id) {
            throw new ApiError("No teacher id found for getting all the contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const contests = await ContestRepository.getPastContests(user.id);
        if (!contests) {
            throw new ApiError("Failed to fetch past contests.");
        }
        const newData = contests.map((contest) => ({
            ...cleanObject(contest),
            allowedLanguages: contest?.allowedLanguages.map(lang => ({...lang.language})),
            tags: contest?.tags.map((tag) => ({ ...tag.tag })),

        }));
        return  newData;
    }
}



type UpdateData = {
    batchContests: { batch: { name: string; id: string; } }[];
    title: string; description: string; startTime: Date; endTime: Date;
    tags: { tag: { name: string; id: string; } }[]; id: string;
    allowedLanguages: { language: { name: string; id: string; } }[];
    contestModerators: { moderator: { name: string; id: string; email: string; } }[];
    subject: {
        name: string;
        id: string;
    } | null
}