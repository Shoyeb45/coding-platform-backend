import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { StudentController } from "../controllers/student.conttoller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();


/**
 * GET /contest/upcoming
 * @description API endpoint to get all the upcoming contests
 * @returns
"data": {
    "upcomingContests": [
        {
            "id": "cmelpqzfo000on5qov8n7bxd5",
            "title": "Test Contest-1",
            "description": "",
            "startTime": "2025-08-22T15:00:00.000Z",
            "endTime": "2025-08-25T18:00:00.000Z",
            "creator": {
                "id": "02640eb6-c461-4ff7-8bf5-7d1da1e5f665",
                "name": "Shoyeb Teacher",
                "email": "mohammad.ansari4@pw.live"
            },
            "tags": [
                {
                    "name": "Two Pointers",
                    "id": "cmek33xog0000f8icqcf79rwm"
                }
            ]
        }
    ]
},
 */
router.route("/contest/upcoming")
    .get(authenticateUser, asyncHandler(StudentController.getUpcomingContests));


/**
 * GET /problems
 * @description API endpoint to get all the public problems
 * @returns
"data": {
    "problems": [{
        "id": "cmelleqet0005f8eobmhyfiaw",
        "title": "Multiply Strings",
        "difficulty": "Easy",
        "creator": {
            "id": "db4706c7-f8c7-467f-9b8b-81726c9e24a7",
            "name": "Arayn Teacher",
            "email": "aryan.chauhan@pw.live"
        },
        "problemTags": [
            {
                "id": "cmek33xog0000f8icqcf79rwm",
                "name": "Two Pointers"
            }
        ],
        "isSolved": true
    }]
},
 */
router.route("/problems")
    .get(authenticateUser, asyncHandler(StudentController.getAllPublicProblems));

/**
 * GET /contest/past
 * @description API endpoint to get all the past contests of that user
 * @returns
"data": {
    "pastContests": [{
        "contest_id": "cmem2r8sb0001f8ucadp919bb",
        "title": "subah ka hai",
        "description": "sdfdvsfd",
        "startDate": "2025-08-22T04:10:00.000Z",
        "endDate": "2025-08-22T17:15:00.000Z",
        "maximumPossibleScore": 1180,
        "totalQuestions": 2,
        "questionsSolved": 0,
        "finalScore": 0,
        "rank": 0,
        "isPublished": false,
        "subject": {
            "id": "9340dd82-b6f1-4211-95f3-2c8afc6862a6",
            "name": "Javascript",
            "code": "24BJS102"
        }
    } ,....., {} ]
},
 */
router.route("/contest/past")
    .get(authenticateUser, asyncHandler(StudentController.getPastContests));


/**
 * GET /contest-stats
 * @description Get details of the current student, rank, totalExams, questionSolved
 * @returns
Example response:
"data": {
    "statistics": {
        "currentRank": 2,
        "totalExams": 1,
        "totalQuestionsSolved": 1,
        "totalScore": 130
    }
},
 */
router.route("/contest-stats")
    .get(authenticateUser, asyncHandler(StudentController.getStudentStats));
export default router;