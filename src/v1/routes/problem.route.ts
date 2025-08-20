import { NextFunction, Response, Router, Request } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZProblem, ZProblemCreate, ZProblemDriverCode, ZProblemDriverCodeUpdate, ZProblemModerator } from "../types/problem.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProblemController } from "../controllers/problem.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);


/**
 * API Prefix: /api/v1/problems
 */


/**
 * GET /creator
 * 
 * @description Get all problems created by the authenticated user
 * @access Private
 * @returns {Object} data: { 
 *   problems: {
        tags: {
            id: string;
            name: string;
        }[];
        title: string;
        id: string;
        constraints: string;
        problemStatement: string;
        difficulty: $Enums.Difficulty;
        isPublic: boolean;
        problemWeight: number;
        testcaseWeight: number;
        updatedAt: Date;
        creator: {
            id: string;
            name: string;
            email: string;
        } | null;
}[]
 *  
 *  }
 */
router.route("/all")
    .get(asyncHandler(ProblemController.getAllProblemsOfCreator));


/**
 * POST /moderator
 * 
 * @description Add moderators to a problem
 * @access Private
 * @body {Object} ZProblemModerator - { problemId: string, moderatorIds: string[] }
 * @returns {Object} data: { }
 */
router.route("/moderator")
    .post(validate(ZProblemModerator), asyncHandler(ProblemController.addModeratorsToProblem));

/**
 * GET /moderator/:problemId
 * 
 * @description Get all moderators of a specific problem
 * @access Private
 * @param {string} problemId - The ID of the problem
 * @returns {Object} data: { 
 *   moderators: {
 *     id: string;
 *     name: string;
 *     email: string;
 *     designation: string | null;
 *   }[]
 * }
 */
router.route("/moderator/:problemId")
    .get(asyncHandler(ProblemController.getModeratorsOfProblem));


/**
 * DELETE /moderator/:id
 * 
 * @description Delete moderator from a specific problem, id
 */
router.route("/moderator/:id")
    .delete(asyncHandler(ProblemController.deleteModeratorFromProblem));


/**
 * POST /
 * 
 * @description Create a new problem
 * @access Private
 * @body {Object} ZProblemCreate - Problem creation data
 * @returns {Object} data: { title: string, id: string }
 */
router.route("/")
    .post(validate(ZProblemCreate), asyncHandler(ProblemController.createProblem));

/**
 * GET /
 * 
 * @description Get all problems with optional filtering
 * @access Private
 * @query {boolean} [isActive] - Filter by active status
 * @query {boolean} [isPublic] - Filter by public status
 * @query {string} [difficulty] - Filter by difficulty ("Easy" | "Medium" | "Hard")
 * @returns {Object} data: { 
 *   problems: {
 *     tags: { id: string; name: string; }[];
 *     title: string;
 *     id: string;
 *     constraints: string;
 *     problemStatement: string;
 *     difficulty: Difficulty;
 *     isPublic: boolean;
 *     problemWeight: number;
 *     testcaseWeight: number;
 *     updatedAt: Date;
 *     creator: { id: string; name: string; email: string; } | null;
 *   }[]
 * }
 */
router.route("/")
    .get(asyncHandler(ProblemController.getAllProblems));

/**
 * GET /tags/:id
 * 
 * @description Get all tags associated with a problem
 * @access Private
 * @param {string} id - The problem ID
 * @returns {Object} data: { tags: { id: string, name: string }[] }
 */
router.route("/tags/:id")
    .get(asyncHandler(ProblemController.getTagsOfProblem));

/**
 * POST /driver-code/:problemId
 * 
 * @description Add driver code to a problem for a specific language
 * @access Private
 * @param {string} problemId - The problem ID
 * @body {Object} ZProblemDriverCode - {
 *   languageId: string;
 *   prelude: string;
 *   boilerplate: string;
 *   driverCode: string;
 * }
 * @returns {Object} data: {
 *   prelude: string;
 *   boilerplate: string;
 *   driverCode: string;
 *   id: string;
 *   language: { id: string; name: string; };
 * }
 */
router.route("/driver-code/:problemId")
    .post(validate(ZProblemDriverCode), asyncHandler(ProblemController.addDriverCode));

/**
 * GET /driver-code/:problemId
 * 
 * @description Get driver code for a problem, optionally filtered by language
 * @access Private
 * @param {string} problemId - The problem ID
 * @query {string} [languageId] - Optional language filter
 * @example /api/v1/problems/driver-code/123?languageId=abc123
 * @returns {Object} data: {
 *   prelude: string;
 *   boilerplate: string;
 *   driverCode: string;
 *   id: string;
 *   language: { id: string; name: string; };
 * }[]
 */
router.route("/driver-code/:problemId")
    .get(asyncHandler(ProblemController.getDriverCodes));

/**
 * PATCH /driver-code/:id
 * 
 * @description Partially update driver code
 * @access Private
 * @param {string} id - The driver code ID (NOT problem ID)
 * @body {Object} ZProblemDriverCodeUpdate - {
 *   languageId?: string;
 *   prelude?: string;
 *   boilerplate?: string;
 *   driverCode?: string;
 * }
 * @returns {Object} data: { updatedDriverCode: DriverCode }
 */
router.route("/driver-code/:id")
    .patch(validate(ZProblemDriverCodeUpdate), asyncHandler(ProblemController.updateDriverCode));

/**
 * DELETE /driver-code/:id
 * 
 * @description Remove driver code
 * @access Private
 * @param {string} problemId - The driver code ID 
 * @query id -> testcase id
 * @returns {Object} data: {
 *   deletedDriverCodes: {
 *     prelude: string;
 *     boilerplate: string;
 *     driverCode: string;
 *     id: string;
 *   }
 * }
 */
router.route("/driver-code/:problemId")
    .delete(asyncHandler(ProblemController.deleteDriverCode));

/**
 * GET /:id
 * 
 * @description Get detailed information about a specific problem
 * @access Private
 * @param {string} id - The problem ID
 * @returns {Object} data: {
 *   problem: {
 *     tags: { name: string; id: string; }[];
 *     id: string;
 *     title: string;
 *     constraints: string;
 *     problemStatement: string;
 *     difficulty: Difficulty;
 *     isPublic: boolean;
 *     problemWeight: number;
 *     testcaseWeight: number;
 *     updatedAt: Date;
 *     creator: { name: string; id: string; email: string; } | null;
 *   }
 * }
 */
router.route("/:id")
    .get(asyncHandler(ProblemController.getProblemById));

/**
 * DELETE /:id
 * 
 * @description Delete a problem
 * @access Private
 * @param {string} id - The problem ID
 * @returns {Object} data: { deletedProblem: Problem }
 */
router.route("/:id")
    .delete(asyncHandler(ProblemController.removeProblem));

/**
 * PATCH /:id
 * 
 * @description Update a problem
 * @access Private
 * @param {string} id - The problem ID
 * @body {Object} ZProblem - {
 *   title?: string;
 *   constraints?: string;
 *   problemStatement?: string;
 *   difficulty?: "Easy" | "Medium" | "Hard";
 *   isPublic?: boolean;
 *   problemWeight?: number;
 *   testcaseWeight?: number;
 *   tags?: string[]; // Array of tag IDs
 * }
 * @returns {Object} data: { updatedProblem: Problem }
 */
router.route("/:id")
    .patch(validate(ZProblem), asyncHandler(ProblemController.updateQuestion));

export default router;