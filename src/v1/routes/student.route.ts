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
router.route("/contest/upcoming/")
    .get(authenticateUser, asyncHandler(StudentController.getUpcomingContests));


/**
 * GET /problems
 * @description API endpoint to get all the public problems
 * @returns
 "data": {
        "problems": [
            {
                "id": "cmelleqet0005f8eobmhyfiaw",
                "title": "Multiply Strings",
                "difficulty": "Easy",
                "creator": {
                    "id": "db4706c7-f8c7-467f-9b8b-81726c9e24a7",
                    "email": "aryan.chauhan@pw.live",
                    "name": "Arayn Teacher"
                },
                "tags": [
                    {
                        "id": "cmek33xog0000f8icqcf79rwm",
                        "name": "Two Pointers"
                    }
                ]
            }
        ]
    },
 */
router.route("/problems")
    .get(authenticateUser, asyncHandler(StudentController.getAllPublicProblems))
export default router;