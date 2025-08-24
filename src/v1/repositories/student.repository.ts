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
        const result = await prisma.$queryRaw<{
            contestId: string;
            title: string;
            description: string;
            startDate: Date;
            endDate: Date;
            maximumPossibleScore: number;
            totalQuestions: number;
            questionsSolved: number;
            finalScore: number;
            rank: number;
            isPublished: boolean;
            subject: {
                id: string;
                name: string;
                code: string;
            } | null; // Nullable because subjectId is optional in Contest
        }[]>`
    WITH past_contests AS (
      SELECT 
        c."id", 
        c."title", 
        c."description", 
        c."start_time", 
        c."end_time", 
        c."is_published",
        c."subject_id"
      FROM "contest" c
      WHERE c."end_time" < NOW()
    ),
    contest_max_score AS (
      SELECT 
        cp."contest_id",
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
      JOIN "contest_problem" cp 
        ON cp."contest_id" = sbs."contest_id" 
       AND cp."problem_id" = sbs."problem_id"
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
        pc."is_published",
        pc."subject_id",
        cms.max_score AS maximum_possible_score,
        cms.total_questions,
        COALESCE(scs.final_score, 0) AS final_score,
        COALESCE(scs.questions_solved, 0) AS questions_solved,
        cl.rank
      FROM past_contests pc
      JOIN contest_max_score cms ON cms.contest_id = pc."id"
      LEFT JOIN student_contest_scores scs 
        ON scs."contest_id" = pc."id" 
       AND scs."student_id" = ${studentId}
      LEFT JOIN contest_leaderboard cl 
        ON cl."contest_id" = pc."id" 
       AND cl."student_id" = ${studentId}
    )
    SELECT 
      spc.contest_id AS "contestId",
      spc.title,
      spc.description,
      spc.start_date AS "startDate",
      spc.end_date AS "endDate",
      spc.maximum_possible_score AS "maximumPossibleScore",
      spc.total_questions AS "totalQuestions",
      spc.questions_solved AS "questionsSolved",
      spc.final_score AS "finalScore",
      spc.rank::int,
      spc.is_published AS "isPublished",
      json_build_object(
        'id', s."id",
        'name', s."name",
        'code', s."code"
      ) AS "subject"
    FROM student_past_contests spc
    LEFT JOIN "Subject" s ON s."id" = spc."subject_id"
    ORDER BY spc.end_date DESC;
  `;

        return result;
    };


    static getProblemsOfTheContest = async (studentId: string, contestId: string) => {
        return await prisma.contestProblem.findMany({
            where: {
                contestId
            },
            select: {
                problem: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        submissions: {
                            where: {
                                studentId,
                                status: "Accepted", // Adjust if status is stored differently
                            },
                            select: {
                                id: true,
                            },
                            take: 1, // Only need one to check existence
                        },
                        testcaseWeight: true, problemWeight: true
                    }
                }, point: true
            }
        })
    }


    static getStudentStats = async (studentId: string) => {

        const result = await prisma.$queryRaw<{
            currentRank: string,
            totalExams: string,
            totalQuestionsSolved: string,
            totalScore: string,
        }[]>`
WITH student_info AS (
    -- Get the target student's batch
    SELECT s.id as student_id, s.batch_id, s.name, s.email
    FROM "Student" s
    WHERE s.id = ${studentId}
),
batch_contests AS (
    -- Get all contests assigned to the student's batch
    SELECT DISTINCT bc.contest_id
    FROM "batch_contest" bc
    JOIN student_info si ON si.batch_id = bc.batch_id
),
batch_students AS (
    -- Get all students in the same batch
    SELECT s.id as student_id, s.name, s.email
    FROM "Student" s
    JOIN student_info si ON si.batch_id = s.batch_id
),
student_accepted_questions AS (
    -- Count unique accepted submissions for each student
    SELECT 
        s.student_id,
        COUNT(DISTINCT CONCAT(s.problem_id, '-', s.contest_id)) as total_accepted_questions
    FROM "submission" s
    WHERE s.student_id = ${studentId} AND s.status = 'Accepted'
    GROUP BY s.student_id
),
student_contest_scores AS (
    -- Calculate best score per contest per student in the batch
    SELECT 
        s.student_id,
        s.contest_id,
        MAX(s.score * cp.point) as contest_weighted_score
    FROM "submission" s
    JOIN "contest_problem" cp ON cp.contest_id = s.contest_id AND cp.problem_id = s.problem_id
    JOIN batch_contests bc ON bc.contest_id = s.contest_id
    JOIN batch_students bs ON bs.student_id = s.student_id
    GROUP BY s.student_id, s.contest_id
),
student_totals AS (
    -- Calculate total stats per student
    SELECT 
        bs.student_id,
        bs.name as student_name,
        bs.email as student_email,
        COALESCE(SUM(scs.contest_weighted_score), 0) as total_score,
        COALESCE(COUNT(DISTINCT scs.contest_id), 0) as total_exams,
        MAX(sub.submitted_at) as last_submission_time
    FROM batch_students bs
    LEFT JOIN student_contest_scores scs ON scs.student_id = bs.student_id
    LEFT JOIN "submission" sub ON sub.student_id = bs.student_id 
        AND sub.contest_id IN (SELECT contest_id FROM batch_contests)
    GROUP BY bs.student_id, bs.name, bs.email
),
ranked_students AS (
    -- Rank students within the batch
    SELECT 
        st.*,
        ROW_NUMBER() OVER (
            ORDER BY st.total_score DESC, 
                     st.total_exams DESC,
                     st.last_submission_time ASC NULLS LAST
        ) as current_rank
    FROM student_totals st
)
SELECT 
    rs.current_rank as "currentRank",
    rs.total_exams as "totalExams",
    COALESCE(saq.total_accepted_questions, 0) as "totalQuestionsSolved",
    rs.total_score as "totalScore"
FROM student_info si
LEFT JOIN ranked_students rs ON rs.student_id = si.student_id
LEFT JOIN student_accepted_questions saq ON saq.student_id = si.student_id;
`;

        return result[0];
    }
}