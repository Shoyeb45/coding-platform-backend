import { Prisma } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { prisma } from "../../utils/prisma";
import { TContest, TContestCreate, TContestMod, TContestProblem } from "../types/contest.type";
import { TProblemCreate, TProblemFilter, TProblemModerator, TProblemUpdate } from "../types/problem.type";
import { cleanObject } from "../../utils/helper";

export class ContestRepository {

    static create = async (createdBy: string, data: TContestCreate) => {

        const createdContest = await prisma.contest.create({
            data: { ...data, createdBy },
            select: {
                id: true, title: true, creator: {
                    select: {
                        id: true, name: true, email: true, designation: true
                    }
                }
            }
        });

        return createdContest;
    }

    static deleteContest = async (contestId: string) => {
        return prisma.contest.delete({
            where: { id: contestId },
            select: { id: true, title: true, description: true }
        });
    }

    static getByTitle = async (title: string) => {
        return await prisma.contest.findFirst({ where: { title } });
    }

    static publishContest = async (contestId: string) => {
        return await prisma.contest.update({
            where: { id: contestId },
            data: {
                isPublished: true
            }, select: {
                id: true, title: true, description: true
            }
        });
    }

    static countParticipants = async (contestId: string) => {
        return await prisma.student.count({
            where: {
                batch: {
                    contests: {
                        some: {
                            contestId: contestId
                        }
                    }
                }
            }
        });
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
                }, creator: {
                    select: {
                        id: true, name: true, email: true, designation: true
                    }
                }, subject: {
                    select: { id: true, name: true }
                }
            }
        });

        return rawData;
    }

    static getProblemContest = async (problemId: string, contestId: string) => {
        return await prisma.contestProblem.findFirst({
            where: { problemId, contestId },
            select: {
                point: true
            }
        });
    }

    static deleteModerator = async (id: string) => {
        const deletedMod = await prisma.contestModerator.delete({
            where: { id }
        });
        return deletedMod;
    }

    static update = async (id: string, data: Prisma.ContestUpdateInput) => {
        console.log(data);

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
                }, subject: {
                    select: { id: true, name: true }
                }
            }
        });


        return updatedContest;
    }

    static addProblemToContest = async (contestId: string, data: TContestProblem) => {
        let problemData: {
            point: number, problemId: string, contestId: string
        }[] = data.problems.map((problem) => ({ contestId, point: problem.point, problemId: problem.problemId }));

        return await prisma.contestProblem.createMany({
            data: problemData
        });
    }

    static getCountOfParticipants = async (contestId: string) => {
        const result = await prisma.$queryRaw<{ unique_participants: number }[]>
            `SELECT COUNT(DISTINCT student_id) AS unique_participants 
            FROM submission 
            WHERE contest_id = ${contestId};`;
        return Number(result[0].unique_participants);
    }

    static deleteProblem = async (id: string) => {
        return await prisma.contestProblem.delete({ where: { id } });
    }
    static getAllProblems = async (contestId: string) => {
        const rawData = await prisma.contestProblem.findMany({
            where: { contestId },
            select: {
                point: true,
                id: true,
                problem: {
                    select: { id: true, title: true, difficulty: true, testcaseWeight: true, problemWeight: true }
                },
            }
        });
        return rawData;
    }

    static getContestsForUser = async (createdBy: string) => {
        const rawData = await prisma.contest.findMany({
            where: {
                createdBy,
                endTime: {
                    gt: new Date()
                }
            },
            select: {
                id: true, title: true, description: true, startTime: true, endTime: true, tags: {
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

    static getPastContests = async (createdBy: string) => {
        const rawData = await prisma.contest.findMany({
            where: {
                createdBy,
                endTime: {
                    lt: new Date(),
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                endTime: true,
                isPublished: true,
                tags: {
                    select: {
                        tag: {
                            select: { id: true, name: true },
                        },
                    },
                },
                allowedLanguages: {
                    select: {
                        language: {
                            select: { id: true, name: true },
                        },
                    },
                },
                subject: {
                    select: { id: true, name: true },
                },
                batchContests: {
                    select: {
                        batch: {
                            select: {
                                students: {
                                    select: { id: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        

        return rawData;
    };

    static getTimings = async (contestId: string) => {
        return await prisma.contest.findFirst({
            where: { id: contestId },
            select: {
                id: true, startTime: true, endTime: true
            }
        });
    }
    static getBatches = async (contestId: string) => {
        return await prisma.batchContest.findMany({
            where: { contestId }, select: {
                batch: {
                    select: {
                        id: true, name: true
                    }
                }
            }
        })
    }
    static getAllModerators = async (contestId: string) => {
        const rawData = await prisma.contestModerator.findMany({
            where: { contestId },
            select: {
                id: true,
                moderator: {
                    select: { id: true, name: true, email: true, designation: true }
                }
            }
        });
        return rawData;
    }

    static addModerators = async (contestId: string, data: TContestMod) => {
        const mods = data.moderatorIds.map((id) => ({ contestId, moderatorId: id }));

        return await prisma.contestModerator.createMany({
            data: mods,
        });
    }
}   
