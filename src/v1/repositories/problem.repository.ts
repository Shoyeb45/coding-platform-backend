import { logger } from "../../utils/logger";
import { prisma } from "../../utils/prisma";
import { TProblemCreate, TProblemDriver, TProblemDriverUpdate, TProblemFilter, TProblemModerator, TProblemUpdate } from "../types/problem.type";

export class ProblemRepository {
    static getProblemByTitle = async (title: string) => {
        const problem = await prisma.problem.findFirst({
            where: {
                title: title,
                isActive: true
            },
        })
        return problem;
    }
    static create = async (data: TProblemCreate) => {

        const createdProblem = await prisma.problem.create({
            data: { ...data },
            select: {
                id: true, title: true
            }
        });

        return createdProblem;
    }

    static getDriverCode = async (problemId: string, languageId: string) => {
        return await prisma.problemLanguage.findFirst({
            where: { languageId, problemId },
            select: {
                id: true,
                language: {
                    select: {
                        name: true, id: true
                    }
                }, prelude: true, driverCode: true, boilerplate: true
            }
        })
    }
    static getModerator = async (id: string) => {
        return await prisma.problemModerator.findFirst({
            where: { id }, select: {
                id: true, problem: {
                    select: {
                        createdBy: true
                    }
                }
            }
        });
    }

    static deleteDriverCodes = async (id: string) => {
        return await prisma.problemLanguage.delete({
            where: { id }, select: {
                id: true, prelude: true, boilerplate: true, driverCode: true
            }
        });
    }

    static deleteModerator = async (id: string) => {
        return await prisma.problemModerator.delete({ where: { id } });
    }

    static getScoreById = async (id: string) => {
        return await prisma.problem.findFirst({
            where: { id },
            select: {
                testcaseWeight: true, problemWeight: true
            }
        });
    }
    static getProblemById = async (id: string) => {
        const rawData = await prisma.problem.findFirst({
            where: { id, isActive: true }, select: {
                id: true, title: true, problemStatement: true, constraints: true, difficulty: true, problemWeight: true, testcaseWeight: true, isPublic: true, updatedAt: true, creator: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                problemTags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!rawData) {
            return undefined;
        }

        const { problemTags, ...problemData } = rawData;

        return { ...problemData, tags: problemTags.map(pt => pt.tag) };
    }

    static getAllProblems = async (where: TProblemFilter, userId: string) => {
        console.log(where);

        const rawProblems = await prisma.problem.findMany({
            select: {
                id: true,
                title: true,
                difficulty: true,
                isPublic: true,
                creator: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
                problemTags: {
                    select: {
                        tag: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                    },
                },
                problemModerators: {
                    where: {
                        moderatorId: userId,   // check if this user is a moderator
                    },
                    select: { id: true },    // we just need existence
                },
            },
            where: {
                isActive: true,
            },
        });

        const problems = rawProblems.map((problem) => {
            const { problemTags, problemModerators, ...problemData } = problem;
            const tags = problemTags.map((pt) => pt.tag);

            return {
                ...problemData,
                tags,
                isModerator: problemModerators.length > 0, // true if user is moderator
            };
        });

        return problems;
    };


    static getProblemDetails = async (id: string) => {
        const data = await prisma.problem.findFirst({
            where: { id },
            select: {
                id: true, title: true, problemStatement: true, constraints: true,
                problemLanguage: {
                    select: {
                        id: true, boilerplate: true, language: {
                            select: {
                                id: true, name: true, judge0Code: true
                            }
                        }
                    }
                }, problemTags: {
                    select: {
                        tag: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        return data;
    }

    static updateProblem = async (id: string, data: TProblemUpdate) => {
        const updateProblem = await prisma.problem.update({
            data, where: { id }, select: {
                id: true, title: true, problemStatement: true, constraints: true, difficulty: true, problemWeight: true, testcaseWeight: true, isPublic: true, updatedAt: true, creator: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    },
                },
                problemTags: {
                    select: {
                        tag: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            }
        });

        const { problemTags, ...problemData } = updateProblem;

        return { ...problemData, tags: problemTags.map(pt => pt.tag) };
    }

    static addTags = async (problemId: string, tagIds: string[]) => {
        const data = tagIds.map((tagId) => ({ problemId, tagId }))
        await prisma.problemTag.createMany({ data, skipDuplicates: true });
    }

    static getTags = async (problemId: string) => {
        const data = await prisma.problemTag.findMany({
            where: {
                problemId: problemId
            },
            select: {
                tag: {
                    select: {
                        id: true,
                        name: true
                    }
                },
            }
        });
        return data;
    }

    static softRemove = async (problemId: string) => {
        const updatedProblem = await prisma.problem.update({
            where: { id: problemId },
            data: {
                isActive: false
            }
        });
        return updatedProblem;
    }

    static getProblemsOfCreator = async (createdBy: string) => {
        logger.info(createdBy)
        const rawProblems = await prisma.problem.findMany({
            where: {
                createdBy: createdBy, isActive: true
            },
            select: {
                id: true, title: true, problemStatement: true, constraints: true, difficulty: true, problemWeight: true, testcaseWeight: true, isPublic: true, updatedAt: true, creator: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                problemTags: {
                    select: {
                        tag: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            }
        })


        const problems = rawProblems.map((problem) => {
            const { problemTags, ...problemData } = problem;
            const tags = problemTags.map(pt => pt.tag);
            return { ...problemData, tags };
        });

        return problems;
    }

    static addModerators = async (data: TProblemModerator) => {
        const moderatorData = data.moderatorIds.map((id) => ({ problemId: data.problemId, moderatorId: id }));

        const problemModerator = await prisma.problemModerator.createMany({
            data: moderatorData,
            skipDuplicates: true
        });
        return problemModerator;
    };

    static getModerators = async (problemId: string) => {
        const mods = await prisma.problemModerator.findMany({
            where: {
                problemId
            },
            select: {
                id: true,
                moderator: {
                    select: {
                        id: true, name: true, email: true, designation: true
                    }
                }
            }
        })

        return mods;
    }

    static addDriverCode = async (problemId: string, data: TProblemDriver) => {
        const createdDriverCode = await prisma.problemLanguage.create({
            data: {
                problemId, ...data
            }, select: {
                id: true,
                language: {
                    select: {
                        name: true, id: true
                    }
                }, prelude: true, driverCode: true, boilerplate: true
            }
        });
        return createdDriverCode;
    }

    static getDriverCodes = async (data: { problemId: string, languageId?: string }) => {
        const rawData = await prisma.problemLanguage.findMany({
            where: { ...data },
            select: {
                id: true,
                language: {
                    select: {
                        name: true, id: true
                    }
                }, prelude: true, driverCode: true, boilerplate: true
            }
        });
        return rawData;
    }

    static updateDriverCode = async (id: string, data: TProblemDriverUpdate) => {
        const updatedData = await prisma.problemLanguage.update({
            where: { id }, data, select: {
                id: true, language: { select: { name: true, id: true } }, prelude: true, driverCode: true, boilerplate: true
            }
        });

        return updatedData;
    }
}   
