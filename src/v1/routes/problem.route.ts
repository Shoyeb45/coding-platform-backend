import { NextFunction, Response, Router, Request } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZProblem, ZProblemCreate, ZProblemDriverCode, ZProblemDriverCodeUpdate, ZProblemModerator } from "../types/problem.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProblemController } from "../controllers/problem.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticateUser);

router.route("/creator")
    .get(asyncHandler(ProblemController.getAllProblemsOfCreator));


// api to add moderator of the contest, see ZProblemModerator for input
router.route("/moderator")
    .post(validate(ZProblemModerator), asyncHandler(ProblemController.addModeratorsToProblem));

// get all the moderators of particualr problemId(in params), 
// response: 
// data: {
//  moderators: {
//     id: string;
//     name: string;
//     email: string;
//     designation: string | null;
//   }[]
// }
router.route("/moderator/:problemId")
    .get(asyncHandler(ProblemController.getModeratorsOfProblem));

// api to create a problem, see ZProblemCreate
// response:
// data: {
//    title: string, id: string
// }
router.route("/")
    .post(validate(ZProblemCreate), asyncHandler(ProblemController.createProblem));

// api to get all the problems, with following query
// request: 
// {
//     isActive?: boolean;
//     isPublic?: boolean;
//     difficulty?: "Easy" | "Medium" | "Hard" | undefined;
// }  
// response: 
// data: {problems: {
//     tags: {
//         id: string;
//         name: string;
//     }[];
//     title: string;
//     id: string;
//     constraints: string;
//     problemStatement: string;
//     difficulty: $Enums.Difficulty;
//     isPublic: boolean;
//     problemWeight: number;
//     testcaseWeight: number;
//     updatedAt: Date;
//     creator: {
//         id: string;
//         name: string;
//         email: string;
//     } | null;
// }[]}
router.route("/")
    .get(asyncHandler(ProblemController.getAllProblems));

// get all the tags of the problem 
// id -> problemId in params
// response: 
// data: {
//     tags: { id: string, name: string }[]
// }
router.route("/tags/:id")
    .get(asyncHandler(ProblemController.getTagsOfProblem));


// add driver codes to the problem, problemId in params
// request body: {
//     languageId: string;
//     prelude: string;
//     boilerplate: string;
//     driverCode: string;
// }
// response:  data: {
//     prelude: string;
//     boilerplate: string;
//     driverCode: string;
//     id: string;
//     language: {
//         id: string;
//         name: string;
//     };
// }
router.route("/driver-code/:problemId")
    .post(validate(ZProblemDriverCode), asyncHandler(ProblemController.addDriverCode));


// api to get driver code for problem, problemId in params and languageId in query
// api example: /api/v1/problems/driver-code/:problemId?languageId="dfsf"
// response body: 
//    ** same as above **
router.route("/driver-code/:problemId")
    .get(asyncHandler(ProblemController.getDriverCodes));


// api to partially update the problem driver-codes, id in params
// id is the driver code, it is not a problemId   
// reqeust body: 
// {
//     languageId?: string | undefined;
//     prelude?: string | undefined;
//     boilerplate?: string | undefined;
//     driverCode?: string | undefined;
// }
router.route("/driver-code/:id")
    .patch(validate(ZProblemDriverCodeUpdate), asyncHandler(ProblemController.updateDriverCode));

/**
 * api to remove the problem driver codes, id in params
 * id is the driver code, it is not a problemId 
 * respone: 
 * data: {
 *    deletedDriverCodes: {
          prelude: string;
          boilerplate: string;
          driverCode: string;
          id: string;
      }
 * }  
 */
router.route("/driver-code/:id")
    .delete(asyncHandler(ProblemController.deleteDriverCode));


/**
* api to get problem information, id -> problem id
* response:
* data: {
*   problem: {
        tags: {
            name: string;
            id: string;
        }[];
        id: string;
        title: string;
        constraints: string;
        problemStatement: string;
        difficulty: $Enums.Difficulty;
        isPublic: boolean;
        problemWeight: number;
        testcaseWeight: number;
        updatedAt: Date;
        creator: {
            name: string;
            id: string;
            email: string;
        } | null
    }
* }
*/
router.route("/:id")
    .get(asyncHandler(ProblemController.getProblemById));

/**
* api to delete the problem, id is problemId,
* response sabe as above
*/
router.route("/:id")
    .delete(asyncHandler(ProblemController.removeProblem));

/**
* Api to update the problem, id is in params which is problemId
* request body :
* {
    title?: string | undefined;
    constraints?: string | undefined;
    problemStatement?: string | undefined;
    difficulty?: "Easy" | "Medium" | "Hard" | undefined;
    isPublic?: boolean | undefined;
    problemWeight?: number | undefined;
    testcaseWeight?: number | undefined;
    tags?: string[] | undefined; // arrays of tag id
  }
*/
router.route("/:id")
    .patch(validate(ZProblem), asyncHandler(ProblemController.updateQuestion));

export default router;