import { Response } from "express";
import { TContest, TContestCreate, TContestMod, TContestProblem } from "../types/contest.type"
import { logger } from "../../utils/logger"
import { ContestRepository } from "../repositories/contest.repository";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../config/httpCodes";
import { cleanObject } from "../../utils/cleanObject";


export class ContestService {
    static createContest = async (contestInfo: TContestCreate) => {
        const createdContest = await ContestRepository.create(contestInfo);
        if (!createdContest) {
            throw new ApiError("Failed to create a new contest, please try again", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        return createdContest;
    }

    static deleteModerator = async (contestId: string, modData: TContestMod) => {
        if (!contestId) {
            throw new ApiError("Contest id not found.", HTTP_STATUS.BAD_REQUEST);
        }
        const deletedMod = await ContestRepository.deleteModerator(contestId, modData.moderatorId);
        if (!deletedMod) {
            throw new ApiError("Failed to delete moderator from contest.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    
    static deleteProblemFromContest = async (contestId: string, problemId: string) => {
        if (!contestId) {
            throw new ApiError("No contest id found", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        const deletedProblem = await ContestRepository.deleteProblem({ contestId, problemId });
        if (!deletedProblem) {
            throw new ApiError("Failed to delete problem from contest.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    }
    static addModerator = async (contestId: string, modData: TContestMod) => {
        if (!contestId) {
            throw new ApiError("Contest id not found.", HTTP_STATUS.BAD_REQUEST);
        }

        const data = await ContestRepository.addModerator(contestId, modData);
        if (!data) {
            throw new ApiError("Failed to add moderator to the contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return data;
    }

    static getAllModerators = async (contestId: string) => {
        if (!contestId) {
            throw new ApiError("No contest id found", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        const mods = await ContestRepository.getAllModerators(contestId);
        return mods.map(mod => ({ ...mod.moderator }))
    }

    static updateContest = async (contestId: string, contestInfo: TContest) => {
        if (!contestId) {
            throw new ApiError("No contest id found.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
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
            allowedLanguages: allowedLanguages.map(al => ({ id: al.language.id, name: al.language.name }))
        }
        return newData;
    }

    static getContestById = async (contestId: string) => {
        if (!contestId) {
            throw new ApiError("No contest id found", HTTP_STATUS.BAD_REQUEST);
        }

        const data = await ContestRepository.getContestById(contestId);
        if (!data) {
            throw new ApiError("Failed to find the contest detail.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return this.formatContestData(data);
    }

    static addProblemToContest = async (contestId: string, data: TContestProblem) => {
        const addedProblem = await ContestRepository.addProblemToContest(contestId, data);

        if (!addedProblem) {
            new ApiError("Failed to add problem to the contest.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return { points: addedProblem.points, problemId: addedProblem.problem.id, title: addedProblem.problem.title }   
    }

    static getAllProblems = async (contestId: string) => {
        if (!contestId) {
            throw new ApiError("No contest id found to fetch problem.", HTTP_STATUS.BAD_GATEWAY);
        }
        const problems = await ContestRepository.getAllProblems(contestId);

        return problems.map(problem => ({ 
            id: problem.problem.id, 
            title: problem.problem.title, 
            difficulty: problem.problem.difficulty, 
            points: problem.points 
        }));
    }

    static getContests = async (userId: string) => {
        if (!userId) {
            throw new ApiError("No teacher id found for getting all the contest", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        const contests = await ContestRepository.getContestsForUser(userId);

        return contests.map(contest => (this.formatContestData(contest)))
    }
}


type UpdateData = {
    batchContests: { batch: { name: string; id: string; } }[];
    title: string; description: string; startTime: Date; endTime: Date;
    tags: { tag: { name: string; id: string; } }[]; id: string;
    allowedLanguages: { language: { name: string; id: string; } }[];
    contestModerators: { moderator: { name: string; id: string; email: string; } }[];
}