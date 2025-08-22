import { Prisma } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { prisma } from "../../utils/prisma";
import { TContest, TContestCreate, TContestMod, TContestProblem, TProblemContestEdit } from "../types/contest.type";
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

    static updatePointsOfProblem = async (id: string, data: TProblemContestEdit) => {
        return await prisma.contestProblem.update({
            where: { id },
            data: {
                point: data.point
            }, select: {
                id: true, point: true
            }
        })
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

    static getContestLeaderboardData = async (contestId: string) => {
        const result = await prisma.$queryRaw<
            {
                contestId: string;
                title: string;
                description: string;
                startDate: Date;
                endDate: Date;
                isPublished: boolean;
                maximumPossibleScore: number;
                leaderboard: {
                    studentId: string;
                    studentName: string;
                    studentEmail: string;
                    totalScore: number;
                    questionsSolved: number;
                }[];
            }[]
        >`
WITH best_scores AS (
    SELECT 
        s.student_id, 
        s.problem_id, 
        s.contest_id,
        MAX(s.score) AS best_score
    FROM "submission" s
    WHERE s.contest_id = ${contestId}
    GROUP BY s."student_id", s."problem_id", s."contest_id"
),
weighted_scores AS (
    SELECT 
        bs.student_id,
        bs.problem_id,
        bs.contest_id,
        bs.best_score,
        cp.point,
        (bs.best_score * cp.point) AS weighted_score
    FROM best_scores bs
    JOIN "contest_problem" cp ON cp.contest_id = bs.contest_id AND cp.problem_id = bs.problem_id
),
leaderboard AS (
    SELECT
        ws.student_id,
        st.name AS student_name,
        st.email AS student_email,
        SUM(ws.weighted_score) AS total_score,
        COUNT(CASE WHEN ws.best_score > 0 THEN 1 END) AS questions_solved
    FROM weighted_scores ws
    JOIN "Student" st ON st.id = ws.student_id
    GROUP BY ws.student_id, st.name, st.email
    ORDER BY total_score DESC, questions_solved DESC
),
contest_info AS (
    SELECT c."id", c."title", c."description", c."start_time", c."end_time", c."is_published"
    FROM "contest" c
    WHERE c."id" = ${contestId}
),
max_possible_score AS (
    SELECT 
        cp.contest_id,
        SUM(cp.point * (p."problemWeight" + p."testcaseWeight")) AS maximum_score
    FROM "contest_problem" cp
    JOIN "problem" p ON p.id = cp.problem_id
    WHERE cp.contest_id = ${contestId}
    GROUP BY cp.contest_id
)
SELECT 
    ci."id" AS "contestId",
    ci."title",
    ci."description",
    ci."start_time" AS "startDate",
    ci."end_time" AS "endDate",
    ci."is_published" AS "isPublished",
    COALESCE(mps.maximum_score, 0) AS "maximumPossibleScore",
    COALESCE(
        json_agg(
            json_build_object(
                'studentId', lb.student_id,
                'studentName', lb.student_name,
                'studentEmail', lb.student_email,
                'totalScore', lb.total_score,
                'questionsSolved', lb.questions_solved
            ) ORDER BY lb.total_score DESC, lb.questions_solved DESC
        ) FILTER (WHERE lb.student_id IS NOT NULL),
        '[]'::json
    ) AS leaderboard
FROM contest_info ci
LEFT JOIN max_possible_score mps ON mps.contest_id = ci."id"
LEFT JOIN leaderboard lb ON true
GROUP BY ci.id, ci.title, ci.description, ci.start_time, ci.end_time, ci.is_published, mps.maximum_score;
`;


        return result; // contest info + leaderboard
    };
} 
