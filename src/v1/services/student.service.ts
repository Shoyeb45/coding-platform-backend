import { HTTP_STATUS } from "../../config/httpCodes"
import { ApiError } from "../../utils/ApiError"
import { cleanObject } from "../../utils/helper";
import { StudentRepository } from "../repositories/student.repository";

export class StudentService {
    private static authenticateStudent(user: Express.Request["user"]) {
        if (!user?.id) {
            throw new ApiError("No student id found.", HTTP_STATUS.BAD_REQUEST);
        }
        if (user.role !== "STUDENT") {
            throw new ApiError("Only student is allowed to view their past contests.", HTTP_STATUS.UNAUTHORIZED);
        }
    }
    static getUpcomingContests = async (user: Express.Request["user"]) => {
        if (!user?.id) {
            throw new ApiError("No student id found.", HTTP_STATUS.BAD_REQUEST);
        }
        this.authenticateStudent(user);

        const contests = await StudentRepository.getAllUpcomingContests(user?.id);

        if (!contests) {
            throw new ApiError("Failed to fetch upcoming contest.");
        }
        const formattedData = contests.map((contest) => ({
            ...contest,
            tags: contest.tags.map((tag) => ({ ...tag.tag }))
        }));

        return formattedData;
    }

    static getAllPublicProblems = async (user: Express.Request["user"]) => {
        if (!user?.id) {
            throw new ApiError("No user id found.", HTTP_STATUS.UNAUTHORIZED);
        }
        if (user.role !== "STUDENT") {
            throw new ApiError("Unauthorized access, only student is allowed.", HTTP_STATUS.UNAUTHORIZED);
        }
        const problems = await StudentRepository.getAllPublicProblems(user.id);

        if (!problems) {
            throw new ApiError("Failed to find problems.");
        }
        const result = problems.map((problem) => (cleanObject({
            ...problem,
            isSolved: problem.submissions.length > 0,
            problemTags: problem.problemTags.map((pt) => ({ ...pt.tag })),
            submissions: undefined,
        })));


        return result.map((res) => (cleanObject(res)));
    }

    static getPastContests = async (user: Express.Request["user"]) => {
        if (!user?.id) {
            throw new ApiError("No student id found.", HTTP_STATUS.BAD_REQUEST);
        }
        if (user.role !== "STUDENT") {
            throw new ApiError("Unauthorized access, only student is allowed.", HTTP_STATUS.UNAUTHORIZED);
        }

        const contests = await StudentRepository.getPastContests(user.id);

        if (!contests) {
            throw new ApiError("Failed to find all the past contests.");
        }
        return contests.map((contest) => ({
            ...contest,
            maximumPossibleScore: Number(contest.maximumPossibleScore),
            totalQuestions: Number(contest.totalQuestions),
            questionsSolved: Number(contest.questionsSolved),
            finalScore: Number(contest.finalScore),
            rank: Number(contest.rank)
        }));
    }

    static getStudentStats = async (user: Express.Request["user"]) => {
        if (!user?.id) {
            throw new ApiError("No student id found.", HTTP_STATUS.BAD_REQUEST);
        }
        if (user.role !== "STUDENT") {
            throw new ApiError("Unauthorized access, only student is allowed.", HTTP_STATUS.UNAUTHORIZED);
        }

        const data = await StudentRepository.getStudentStats(user.id);

        if (!data) {
            throw new ApiError("Failed to fetch student stats.");
        }

        return {
            currentRank: Number(data.currentRank),
            totalExams: Number(data.totalExams),
            totalQuestionsSolved: Number(data.totalQuestionsSolved),
            totalScore: Number(data.totalScore)
        };
    }
}