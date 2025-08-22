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

        const problems = await StudentRepository.getAllPublicProblems();

        if (!problems) {
            throw new ApiError("Failed to find problems.");
        }
        const newData = problems.map((problem) => (cleanObject({
            ...problem,
            problemTags: undefined,
            tags: problem.problemTags.map((tag) => ({...tag.tag}))
        })));
        return newData;
    }
}