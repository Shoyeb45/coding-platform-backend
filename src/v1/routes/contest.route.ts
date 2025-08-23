import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ContestController } from "../controllers/contest.controller";
import { validate } from "../../middlewares/validate.middleware";
import { ZContest, ZContestCreate, ZContestMod, ZContestProblem, ZProblemContestEdit } from "../types/contest.type";
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
 *          id: string
            title: string;
            description: string;
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
 * GET /past
 * @description API to get past contests
 * data: {
 *   contests: {
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
        isPublished: boolean,
        participants: number
    }[]
 * }
 */
router.route("/past")
    .get(asyncHandler(ContestController.getPastContests));


/**
 * PUT /publish/:contestId
 * @description Publish the contest to the students, they can see the leaderboard and all
 * @param contestId -> Id of the contest
 * @returns
 * "data": {
        "contestDetails": {
            "id": string,
            "title": string,
            "description": string
        }
    },
 */
router.route("/publish/:contestId")
    .put(asyncHandler(ContestController.publishContest));

/**
 * GET /
 * @description Get all contests upcoming and live contests of the teacher
 * @returns 
 * data: {
 *   contests: {
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
 * DELETE /:contestId
 * @description Delete existing contest
 * @return
 * data: {
      deletedContest: {
        id: string;
        title: string;
        description: string;
      }
    }
 */
router.route("/:contestId")
    .delete(asyncHandler(ContestController.deleteContest));


/**
 * GET /problem/:contestId
 * @description Get all the problems of particular contest
 * @param contestId id of the contest
 * @returns
"data": {
    "id": "cmek7tx2u0001n5qwe2fg75cn",
    "title": "DSA IA 2",
    "description": "Hard java programming contest.",
    "startTime": "2025-08-20T15:00:00.000Z",
    "endTime": "2025-08-21T18:06:00.000Z",
    "creator": {
        "id": "02640eb6-c461-4ff7-8bf5-7d1da1e5f665",
        "name": "Shoyeb Teacher",
        "email": "mohammad.ansari4@pw.live",
        "designation": "Professor"
    },
    "subject": {
        "id": "9b3274ab-1689-44fc-acf8-3877c9dfd848",
        "name": "DSA"
    },
    "batchContests": [
        {
            "id": "287d935a-9d5e-4a11-93a0-1c2efab305d7",
            "name": "SOT2023"
        }
    ],
    "contestModerators": [],
    "tags": [
        {
            "id": "cmek33xog0000f8icqcf79rwm",
            "name": "Two Pointers"
        }
    ],
    "allowedLanguages": [
        {
            "id": "cmek5u1j80003n5ds1sz09qbz",
            "name": "C++"
        }
    ],
    "problems": [
        {
            "id": "cmek5a0oq0001n59gdt5o4lhy",
            "title": "Two Sum",
            "difficulty": $Enums.Difficulty;
            "point": 4,
            "isSolved": false
        }  <-- For "STUDENT"
        --------------
        {
            "title": string;
            "id": string;
            "difficulty": $Enums.Difficulty;
            "problemWeight": number;
            "testcaseWeight": number;
        };      <-- For Teacher
    ]
},
 */
router.route("/problem/:contestId")
    .get(asyncHandler(ContestController.getAllProblems));

/**
 * POST /problem/:contestId
 * @description add problem to the contest
 * @param contestId: id of the contest 
 * @body
{
    "problems": [
        {
            "problemId": string,
            "point": number
        }
    ]
}
 * @returns
"data": {
        "problemDetails": [
            {
                "point": 1,
                "id": "cmeljiaw50000n554cxjknu7b",
                "problem": {
                    "id": "cmek5a0oq0001n59gdt5o4lhy",
                    "title": "Two Sum",
                    "difficulty": "Easy",
                    "testcaseWeight": 70,
                    "problemWeight": 30
                }  
            }
        ]
    }
 */
router.route("/problem/:contestId")
    .post(validate(ZContestProblem), asyncHandler(ContestController.addProblemToContest));

/**
 * DELETE /problem/:id
 * @description Delete the problem from the contest
 * @param id it is the contestProblem id
 * @returns 
 * data: {}
 */
router.route("/problem/:id")
    .delete(asyncHandler(ContestController.deleteProblemFromContest));

/**
 * 
 */
router.route("/problem/:id")
    .patch(validate(ZProblemContestEdit), asyncHandler(ContestController.editProblemPointOfContest));

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
router.route("/moderators/:moderatorId")
    .delete(asyncHandler(ContestController.deleteModerator));


/**
 * GET /teacher/leaderboard/:contestId
 * @description API to get the leaderboard of the contest with contest information
 * @param contestId -> Id of the contest
 * @returns
"data": {
    "contestId": "cmek7tx2u0001n5qwe2fg75cn",
    "title": "DSA IA 2",
    "description": "Hard java programming contest.",
    "startDate": "2025-08-20T15:00:00.000Z",
    "endDate": "2025-08-21T18:06:00.000Z",
    "isPublished": false,
    "maximumPossibleScore": 400,
    "totalQuestions": 1,
    "subject": {
        "id": "9b3274ab-1689-44fc-acf8-3877c9dfd848",
        "name": "DSA"
    },
    "batches": [
        {
            "id": "287d935a-9d5e-4a11-93a0-1c2efab305d7",
            "name": "SOT2023"
        }
    ],
    "creator": {
        "id": "02640eb6-c461-4ff7-8bf5-7d1da1e5f665",
        "name": "Shoyeb Teacher",
        "email": "mohammad.ansari4@pw.live"
    },
    "leaderboard": [
        {
            "studentId": "0780f3fc-080a-404c-a3e0-09cce8c6e3cb",
            "studentName": "Shoyeb Student",
            "studentEmail": "shoyeb.sot010069@pwioi.com",
            "totalScore": 130,
            "questionsSolved": 1,
            "rank": 1
        }
    ]
},
 */
router.route("/teacher/leaderboard/:contestId")
    .get(asyncHandler(ContestController.getTeacherContestLeaderboard));


/**
 * GET /problem/detail/:problemId?contestId=
 * @description API to fetch problem details during contest
 * @query contestId
 * @returns
"data": {
    "problemDetail": {
        "id": "cmek5a0oq0001n59gdt5o4lhy",
        "title": "Two Sum",
        "problemStatement": "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order. If no answer found return -1.",
        "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
        "problemTags": [{
                "id": "cmek33xog0000f8icqcf79rwm",
                "name": "Two Pointers"
        }],
        "problemLanguage": [{
                "id": "cmelekm6e0003n56omucw75ff",
                "boilerplate": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};",
                "language": {
                    "id": "cmek5u1j80003n5ds1sz09qbz",
                    "name": "C++",
                    "judge0Code": 105
                }
        }]
    },
    "testcases": [
        {
            "id": "cmek6i46v0000n5vwdwk7wpie",
            "isSample": true,
            "input": "4\n2 7 11 15\n9\n",
            "output": "0 1\n",
            "weight": 1,
            "explanation": "It's simple one"
        }
    ]
},
*/
router.route("/problem/detail/:problemId")
    .get(asyncHandler(ContestController.getProblemDetailsForTheContest));

export default router;