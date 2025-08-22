import { prisma } from "../../utils/prisma"

export class StudentRepository {
    static getBatchId = async (studentId: string) => {
        return await prisma.student.findFirst({
            where: { id: studentId },
            select: {
                batch: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    static getAllUpcomingContests = async (studentId: string) => {
        const upcomingContests = await prisma.contest.findMany({
            where: {
                endTime: { gt: new Date() },
                batchContests: {
                    some: {
                        batch: {
                            students: {
                                some: {
                                    id: studentId,
                                },
                            },
                        },
                    },
                },
            },
            select: {
                id: true, title: true, description: true, startTime: true, endTime: true, creator: {
                    select: { id: true, name: true, email: true },
                }, tags: {
                    select: {
                        tag: {
                            select: {
                                name: true, id: true
                            }
                        }
                    }
                }
            }
        });

        return upcomingContests;
    }


    static getAllPublicProblems = async (userId: string) => {
        return await prisma.problem.findMany({
            where: {
                isPublic: true,
            },
            select: {
                id: true,
                title: true,
                difficulty: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
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
                submissions: {
                    where: {
                        studentId: userId,
                        status: "Accepted", // Adjust if status is stored differently
                    },
                    select: {
                        id: true,
                    },
                    take: 1, // Only need one to check existence
                },
            },
        });
    }

    static getPastContests = async (studentId: string) => {
        const result = await prisma.$queryRaw<
            {
                contest_id: string;
                title: string;
                description: string;
                startDate: Date;
                endDate: Date;
                maximumPossibleScore: number;
                totalQuestions: number;
                questionsSolved: number;
                finalScore: number;
                rank: number;
            }[]
        >`
    WITH past_contests AS (
      SELECT c."id", c."title", c."description", c."start_time", c."end_time"
      FROM "contest" c
      WHERE c."end_time" < NOW()
    ),
    contest_max_score AS (
      SELECT 
        cp."contest_id" AS contest_id,
        SUM(cp."point" * (p."problemWeight" + p."testcaseWeight")) AS max_score,
        COUNT(cp."problem_id") AS total_questions
      FROM "contest_problem" cp
      JOIN "problem" p ON p."id" = cp."problem_id"
      GROUP BY cp."contest_id"
    ),
    student_best_submissions AS (
      SELECT 
        s."contest_id",
        s."problem_id",
        s."student_id",
        MAX(s."score") AS best_score
      FROM "submission" s
      WHERE s."student_id" = ${studentId} AND s."contest_id" IS NOT NULL
      GROUP BY s."contest_id", s."problem_id", s."student_id"
    ),
    student_contest_scores AS (
      SELECT 
        sbs."contest_id",
        sbs."student_id",
        SUM(cp."point" * sbs."best_score") AS final_score,
        COUNT(CASE WHEN sbs."best_score" > 0 THEN 1 END) AS questions_solved
      FROM student_best_submissions sbs
      JOIN "contest_problem" cp ON cp."contest_id" = sbs."contest_id" AND cp."problem_id" = sbs."problem_id"
      GROUP BY sbs."contest_id", sbs."student_id"
    ),
    contest_leaderboard AS (
      SELECT 
        scs."contest_id",
        scs."student_id",
        scs.final_score,
        scs.questions_solved,
        RANK() OVER (PARTITION BY scs."contest_id" ORDER BY scs.final_score DESC) AS rank
      FROM student_contest_scores scs
    ),
    student_past_contests AS (
      SELECT 
        pc."id" AS contest_id,
        pc."title",
        pc."description",
        pc."start_time" AS start_date,
        pc."end_time" AS end_date,
        cms.max_score AS maximum_possible_score,
        cms.total_questions,
        COALESCE(scs.final_score, 0) AS final_score,
        COALESCE(scs.questions_solved, 0) AS questions_solved,
        cl.rank
      FROM past_contests pc
      JOIN contest_max_score cms ON cms.contest_id = pc."id"
      LEFT JOIN student_contest_scores scs ON scs."contest_id" = pc."id" AND scs."student_id" = ${studentId}
      LEFT JOIN contest_leaderboard cl ON cl."contest_id" = pc."id" AND cl."student_id" = ${studentId}
    )
    SELECT 
      contest_id AS "contest_id",
      title,
      description,
      start_date AS "startDate",
      end_date AS "endDate",
      maximum_possible_score AS "maximumPossibleScore",
      total_questions AS "totalQuestions",
      questions_solved AS "questionsSolved",
      final_score AS "finalScore",
      rank::int
    FROM student_past_contests
    ORDER BY end_date DESC;
  `;

        return result;
    };
}