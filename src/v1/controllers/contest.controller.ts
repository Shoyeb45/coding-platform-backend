import { Request, Response } from "express"
import { ContestService } from "../services/contest.service";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";



export class ContestController {

    static getContests = async (req: Request, res: Response) => {
        // TODO: Add actual id
        const contests = await ContestService.getContests("");
    }

    static addModerator = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.addModerator(contestId, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully added moderator the contest.", data)
        )
    } 

    static deleteProblemFromContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        await ContestService.deleteProblemFromContest(contestId, req.body.problemId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully deleted problem from the contest.", {})
        );
    }
    static deleteModerator = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        await ContestService.deleteModerator(contestId, req.body);
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully deleted moderator from the contest.", {})
        )
    } 

    

    static getAllModerators = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.getAllModerators(contestId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all moderators of the contest.", { moderators: data })
        );
    }
    static createContest = async (req: Request, res: Response): Promise<void> => {
        const contestDetail = await ContestService.createContest(req.body);

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Contest created successfully", { contestDetail })
        );
    }

    static updateContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const updatedContestData = await ContestService.updateContest(contestId, req.body);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully update contest with given id", { updatedContestData })
        );
    }

    static getContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const contestDetails = await ContestService.getContestById(contestId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched contest details with give id.", { contestDetails })
        )
    }
    
    static addProblemToContest = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        const data = await ContestService.addProblemToContest(contestId, req.body);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully added problem", { problemDetail: data })
        );
    }

    static getAllProblems = async (req: Request, res: Response) => {
        const contestId = req.params.contestId;
        
        const problems = await ContestService.getAllProblems(contestId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all the problems", { problems })
        );
    }
}