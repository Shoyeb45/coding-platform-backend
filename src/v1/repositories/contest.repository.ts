import { Prisma } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { prisma } from "../../utils/prisma";
import { TContest, TContestCreate, TContestMod, TContestProblem } from "../types/contest.type";
import { TProblemCreate, TProblemFilter, TProblemModerator, TProblemUpdate } from "../types/problem.type";

export class ContestRepository {

    static create = async (data: TContestCreate) => {

        const createdContest = await prisma.contest.create({
            data,
            select: {
                title: true, description: true, startTime: true, endTime: true
            }
        });

        return createdContest;
    }

    static getByTitle = async (title: string) => {
        return await prisma.contest.findFirst({ where: { title }});
    }

    static getContestById = async (id: string) => {
        const rawData = await prisma.contest.findFirst({
            where: { id },
            select: {
                id: true, title: true, description: true, startTime: true, endTime: true, batchContests: {
                    select: {
                        batch: {
                            select: {
                                id: true, name: true
                            }
                        }
                    }
                }, contestModerators: {
                    select: {
                        moderator: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }, tags: {
                    select: {
                        tag: {
                            select: { id: true, name: true }
                        }
                    }
                }, allowedLanguages: {
                    select: {
                        language: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        return rawData;
    }

    static deleteModerator = async (contestId: string, moderatorId: string) => {
        const deletedMod = await prisma.contestModerator.deleteMany({
            where: {
                contestId: contestId,
                moderatorId: moderatorId
            }
        });
        return deletedMod;
    }

    static update = async (id: string, data: Prisma.ContestUpdateInput) => {
        const updatedContest = await prisma.contest.update({
            where: { id },
            data,
            select: {
                id: true, title: true, description: true, startTime: true, endTime: true, batchContests: {
                    select: {
                        batch: {
                            select: {
                                id: true, name: true
                            }
                        }
                    }
                }, contestModerators: {
                    select: {
                        moderator: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }, tags: {
                    select: {
                        tag: {
                            select: { id: true, name: true }
                        }
                    }
                }, allowedLanguages: {
                    select: {
                        language: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });


        return updatedContest;
    }

    static addProblemToContest = async (contestId: string, data: TContestProblem) => {
        return await prisma.contestProblem.create({
            data: {
                contestId: contestId,
                ...data
            }, select: {
                points: true,
                problem: {
                    select: { id: true, title: true }
                }
            }
        });
    }

    static deleteProblem = async (where: { problemId: string, contestId: string}) => {
        return await prisma.contestProblem.deleteMany({ where });
    }
    static getAllProblems = async (contestId: string) => {
        const rawData = await prisma.contestProblem.findMany({
            where: { contestId },
            select: {
                points: true,
                problem: {
                    select: { id: true, title: true, difficulty: true }
                }
            }
        });
        return rawData;
    }

    static getContestsForUser = async (createdBy: string) => {
        const rawData = await prisma.contest.findMany({
            where: { createdBy },
            select: {
                id: true, title: true, description: true, startTime: true, endTime: true, batchContests: {
                    select: {
                        batch: {
                            select: {
                                id: true, name: true
                            }
                        }
                    }
                }, contestModerators: {
                    select: {
                        moderator: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }, tags: {
                    select: {
                        tag: {
                            select: { id: true, name: true }
                        }
                    }
                }, allowedLanguages: {
                    select: {
                        language: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });
        return rawData;
    }

    static getAllModerators = async (contestId: string) => {
        const rawData = await prisma.contestModerator.findMany({
            where: { contestId },
            select: {
                moderator: {
                    select: { id: true, name: true, email: true, designation: true }
                }
            }
        });
        return rawData;
    }

    static addModerator = async (contestId: string, data: TContestMod) => {
        return await prisma.contestModerator.create({
            data: {
                contestId, moderatorId: data.moderatorId
            }, 
            select: {
                moderator: {
                    select: {
                        name: true, id: true, email: true, designation: true
                    }
                }
            }
        });
    }
}   
