import { Request, Response } from "express";
import { StudentService } from "../services/student.service";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";

export class StudentController {
    static getUpcomingContests = async (req: Request, res: Response) => {
        const upcomingContests = await StudentService.getUpcomingContests(req.user);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all the upcoming ontests.", { upcomingContests })
        );
    }

    static getPastContests = async (req: Request, res: Response) => {
        const pastContests = await StudentService.getPastContests(req.user);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all the past ontests.", { pastContests })
        );
    }

    static getAllPublicProblems = async (req: Request, res: Response) => {
        const problems = await StudentService.getAllPublicProblems(req.user);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched public problems.", { problems })
        );
    }

    static getStudentStats = async (req: Request, res: Response) => {
        const statistics = await StudentService.getStudentStats(req.user);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched student statistics.", { statistics })
        );
    }
}