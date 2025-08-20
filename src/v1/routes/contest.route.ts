import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ContestController } from "../controllers/contest.controller";
import { validate } from "../../middlewares/validate.middleware";
import { ZContest, ZContestCreate, ZContestMod, ZContestProblem } from "../types/contest.type";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticateUser);


/**
 * API Prefix: /api/v1/contests
 */



/**
 * POST /
 * @description Create a contest
 * @body : {
 *     title: string
 * }
 * @returns 
 * data: {
 *      contestDetail: {
            title: string;
            description: string;
            startTime: Date;
            endTime: Date;
            creator: {
                id: string;
                name: string;
                email: string;
                designation: string | null;
            };
        }
    }      
 * 
 */
router.route("/")
    .post(validate(ZContestCreate), asyncHandler(ContestController.createContest));

/**
 * GET /
 * @description Get all contests of the teacher
 * @returns 
 * data: {
 *   contests: {
        batchContests: {
            id: string;
            name: string;
        }[];
        contestModerators: {
            id: string;
            name: string;
            email: string;
        }[];
        tags: {
            id: string;
            name: string;
        }[];
        allowedLanguages: {
            id: string;
            name: string;
        }[];
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
        id: string;
    }[]
 * }
 */
router.route("/")
    .get(asyncHandler(ContestController.getContests));

/**
 * PATCH /:contestId
 * @description To edit the contest
 * @param contestId -> Id of the contest
 * @body
 {
    isOpen: boolean;
    title?: string | undefined;
    description?: string | undefined;
    startTime?: string | undefined;
    batches?: string[] | undefined;
    moderators?: string[] | undefined;
    topics?: string[] | undefined;
    endTime?: string | undefined;
    languages?: string[] | undefined;
 }
 * @returns
 * data: {
 *  updatedContestData: {
        batchContests: {
            id: string;
            name: string;
        }[];
        contestModerators: {
            id: string;
            name: string;
            email: string;
        }[];
        tags: {
            id: string;
            name: string;
        }[];
        allowedLanguages: {
            id: string;
            name: string;
        }[];
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
        id: string;
    }
}
 */
router.route("/:contestId")
    .patch(validate(ZContest), asyncHandler(ContestController.updateContest));

/**
 * GET /:contestId
 * @description get the contest detail
 * @param contestId -> Id of the contest
 * @body
 {
    isOpen: boolean;
    title?: string | undefined;
    description?: string | undefined;
    startTime?: string | undefined;
    batches?: string[] | undefined;
    moderators?: string[] | undefined;
    topics?: string[] | undefined;
    endTime?: string | undefined;
    languages?: string[] | undefined;
 }
 * @returns
 * data: {
 *  contestDatails: {
        batchContests: {
            id: string;
            name: string;
        }[];
        contestModerators: {
            id: string;
            name: string;
            email: string;
        }[];
        tags: {
            id: string;
            name: string;
        }[];
        allowedLanguages: {
            id: string;
            name: string;
        }[];
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
        id: string;
    }
}
 */
router.route("/:contestId")
    .get(asyncHandler(ContestController.getContest));


/**
 * GET /problem/:contestId
 * @description Get all the problems of particular contest
 * @param contestId id of the contest
 * @returns
 * data: {
 *      problems: {
            id: string;
            title: string;
            difficulty: $Enums.Difficulty;
            points: number;
        }[]
 * }
 */
router.route("/problem/:contestId")
    .get(asyncHandler(ContestController.getAllProblems));

/**
 * POST /problem/:contestId
 * @description add problem to the contest
 * @param contestId: id of the contest 
 * @body
 * {
 *    problemId: string
 * }
 * @returns
 * data: {
      problemDetail: {
        points: number;
        problemId: string;
        title: string;
    }
 * }
 */
router.route("/problem/:contestId")
    .post(validate(ZContestProblem), asyncHandler(ContestController.addProblemToContest));

/**
 * DELETE /problem/:contestId
 * @description Delete the problem from the contest
 * @param contestId id of the contest
 * @body
 * {
 *    problemId: string
 * }
 * @returns 
 * data: {}
 */
router.route("/problem/:contestId")
    .delete(validate(ZContestProblem.pick({ problemId: true })), asyncHandler(ContestController.deleteProblemFromContest));


/**
 * POST /moderators/:contestId
 * @description API to add the moderator in the contest
 * @param contestId id of the contest 
 * @body
 * {
 *    moderatorId: string
 * }
 * @returns
 *  data: {
        moderator: {
            id: string;
            name: string;
            email: string;
            designation: string | null;
        };
 *  }
 */
router.route("/moderators/:contestId")
    .post(validate(ZContestMod), asyncHandler(ContestController.addModerator));


/**
 * GET /moderators/:contestId
 * @description API to get all the moderators of the contest
 * @param contestId id of the contest 
 * @returns
 *  data: {
        moderators: {
            id: string;
            name: string;
            email: string;
            designation: string | null;
        }[];
 *  }
 */
router.route("/moderators/:contestId")
    .get(asyncHandler(ContestController.getAllModerators));

/**
 * DELETE /moderators/:moderatorId
 * @description API to get delete the moderator from the contest
 * @param moderatorId id of the contest 
 * @returns
 *  data: { }
 */
router.route("/moderators/:contestId")
    .delete(asyncHandler(ContestController.deleteModerator));

export default router;