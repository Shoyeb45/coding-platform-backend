import { Prisma } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { TContestCreate, TContestMod, TContestProblem, TProblemContestEdit } from "../types/contest.type";

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

    static publishContest = async (contestId: string, isPublished: boolean) => {
        return await prisma.contest.update({
            where: { id: contestId },
            data: {
                isPublished: !isPublished
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
                id: true, title: true, description: true, isPublished: true, startTime: true, endTime: true, batchContests: {
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


    static getProblemDetails = async (contestId: string, problemId: string) => {
        const data = await prisma.problem.findFirst({
            where: {
                id: problemId,
                contestProblems: {
                    some: {
                        contestId: contestId,
                    },
                },
            },
            select: {
                id: true,
                title: true,
                problemStatement: true,
                constraints: true,
                problemTags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                problemLanguage: {
                    where: {
                        language: {
                            // Only include languages that are allowed in this contest
                            allowedLanguages: {
                                some: {
                                    contestId: contestId,
                                },
                            },
                        },
                    },
                    select: {
                        id: true,
                        boilerplate: true,
                        language: {
                            select: {
                                id: true,
                                name: true,
                                judge0Code: true,
                            },
                        },
                    },
                },
            },
        });

        return data;
    };
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
        const problemData: {
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

    static getContestsForUser = async (userId: string) => {
        const rawData = await prisma.contest.findMany({
            where: {
                OR: [
                    { createdBy: userId },
                    { contestModerators: { some: { moderatorId: userId } } }
                ],
                endTime: {
                    gt: new Date()
                }
            },
            select: {
                id: true,
                title: true,
                description: true,
                startTime: true,
                endTime: true,
                tags: {
                    select: {
                        tag: { select: { id: true, name: true } }
                    }
                },
                allowedLanguages: {
                    select: {
                        language: { select: { id: true, name: true } }
                    }
                }
            }
        });

        return rawData;
    };


    static getPastContests = async (userId: string) => {
        const rawData = await prisma.contest.findMany({
            where: {
                OR: [
                    { createdBy: userId },
                    { contestModerators: { some: { moderatorId: userId } } }
                ],
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

    // batches, subject, totalQuestions
    static getContestLeaderboardData = async (contestId: string) => {
        const result = await prisma.$queryRaw<
            {
                id: string;
                title: string;
                description: string;
                startDate: Date;
                endDate: Date;
                isPublished: boolean;
                maximumPossibleScore: number;
                totalQuestions: number;
                subject: {
                    id: string;
                    name: string;
                } | null;
                batches: {
                    id: string;
                    name: string;
                }[];
                creator: {
                    id: string;
                    name: string;
                    email: string;
                };
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
    SELECT 
        c."id", 
        c."title", 
        c."description", 
        c."start_time", 
        c."end_time", 
        c."is_published",
        c."created_by" AS creator_id,
        c."subject_id"
    FROM "contest" c
    WHERE c."id" = ${contestId}
),
creator_info AS (
    SELECT 
        t."id", 
        t."name", 
        t."email"
    FROM "Teacher" t
    WHERE t."id" = (SELECT creator_id FROM contest_info)
),
subject_info AS (
    SELECT 
        s."id", 
        s."name"
    FROM "Subject" s
    WHERE s."id" = (SELECT subject_id FROM contest_info)
),
batch_info AS (
    SELECT 
        b."id", 
        b."name"
    FROM "Batch" b
    JOIN "batch_contest" bc ON bc.batch_id = b.id
    WHERE bc.contest_id = ${contestId}
),
max_possible_score AS (
    SELECT 
        cp.contest_id,
        SUM(cp.point * (p."problemWeight" + p."testcaseWeight")) AS maximum_score
    FROM "contest_problem" cp
    JOIN "problem" p ON p.id = cp.problem_id
    WHERE cp.contest_id = ${contestId}
    GROUP BY cp.contest_id
),
total_questions AS (
    SELECT 
        cp.contest_id,
        COUNT(*) AS question_count
    FROM "contest_problem" cp
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
    COALESCE(tq.question_count, 0) AS "totalQuestions",
    CASE 
        WHEN si.id IS NOT NULL THEN 
            json_build_object(
                'id', si.id,
                'name', si.name
            )
        ELSE NULL 
    END AS "subject",
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', bi.id,
                'name', bi.name
            )
        ) FROM batch_info bi),
        '[]'::json
    ) AS "batches",
    json_build_object(
        'id', cr.id,
        'name', cr.name,
        'email', cr.email
    ) AS "creator",
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
    ) AS "leaderboard"
FROM contest_info ci
LEFT JOIN max_possible_score mps ON mps.contest_id = ci."id"
LEFT JOIN total_questions tq ON tq.contest_id = ci."id"
LEFT JOIN creator_info cr ON true
LEFT JOIN subject_info si ON true
LEFT JOIN leaderboard lb ON true
GROUP BY ci.id, ci.title, ci.description, ci.start_time, ci.end_time, ci.is_published, mps.maximum_score, tq.question_count, si.id, si.name, cr.id, cr.name, cr.email;`

        return result; // Return single contest object (not array)
    };



    static getProblemFromTheContest = async (problemId: string, contestId: string) => {
        return await prisma.contestProblem.findFirst({
            where: { problemId, contestId },
            select: {
                id: true, contest: {
                    select: {
                        allowedLanguages: {
                            select: {
                                language: {
                                    select: { id: true }
                                }
                            }
                        }
                    }
                }
            }
        });
    }
} 
