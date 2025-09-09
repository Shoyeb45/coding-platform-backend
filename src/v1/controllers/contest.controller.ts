import { Request, Response } from "express"
import { ContestService } from "../services/contest.service";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";



export class ContestController {

    static getContests = async (req: Request, res: Response) => {
        const contests = await ContestService.getContests(req.user);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all the contests.", { contests })
        );
    }

    static addModerator = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.addModerator(req.user, contestId, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully added moderator the contest.", data)
        )
    }


    static publishContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const contestDetails = await ContestService.publishContest(req.user, contestId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully published the contest.", { contestDetails })
        )
    }
    static deleteContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.deleteContest(req.user, contestId);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully deleted contest.", {deletedContest: data})
        )
    } 

    
    static deleteProblemFromContest = async (req: Request, res: Response) => {
        const id = req.params.id;
        await ContestService.deleteProblemFromContest(req.user, id);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully deleted problem from the contest.", {})
        );
    }
    static deleteModerator = async (req: Request, res: Response) => {
        const moderatorId = req.params.moderatorId;
        const deleteModerator = await ContestService.deleteModerator(req.user, moderatorId);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully deleted moderator from the contest.", { deleteModerator })
        );
    } 

    static editProblemPointOfContest = async (req: Request, res: Response) => {
        const id = req.params.id;
        const updatedProblem = await ContestService.editProblemPointOfContest(req.user, id, req.body);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully changed the point of the problem in given contest.", { updatedProblem })
        );
    }
    

    static getAllModerators = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.getAllModerators(req.user, contestId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all moderators of the contest.", { moderators: data })
        );
    }

    static getPastContests = async (req: Request, res: Response) => {
        const contests = await ContestService.getPastContests(req.user);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched past contests", { contests })
        );
    }
    static createContest = async (req: Request, res: Response): Promise<void> => {
        const contestDetail = await ContestService.createContest(req.user, req.body);

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Contest created successfully", { contestDetail })
        );
    }

    static getTeacherContestLeaderboard = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.getTeacherContestLeaderboard(req.user, contestId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched contest leaderboard.", data)
        );
    }

    static updateContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const updatedContestData = await ContestService.updateContest(req.user, contestId, req.body);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully update contest with given id", { updatedContestData })
        );
    }

    static getContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const contestDetails = await ContestService.getContestById(req.user, contestId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched contest details with give id.", { contestDetails })
        )
    }

    static getProblemDetailsForTheContest = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const contestId = req.query.contestId as string;
        const data = await ContestService.getProblemDetailsForContest(contestId, problemId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched problem details.", data)
        );
    }
    
    static addProblemToContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.addProblemToContest(req.user, contestId, req.body);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully added problem", { problemDetails: data })
        );
    }

    static getAllProblems = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        
        const problems = await ContestService.getAllProblems(req.user, contestId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all the problems", problems)
        );
    }
}