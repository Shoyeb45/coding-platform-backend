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
   
router.route("/moderator")
    .post(validate(ZProblemModerator), asyncHandler(ProblemController.addModeratorsToProblem));

router.route("/moderator/:problemId")
    .get(asyncHandler(ProblemController.getModeratorsOfProblem));

router.route("/")
    .post(validate(ZProblemCreate), asyncHandler(ProblemController.createProblem))
    .get(asyncHandler(ProblemController.getAllProblems));


router.route("/tags/:id")
    .get(asyncHandler(ProblemController.getTagsOfProblem));

router.route("/driver-code/:problemId")
    .post(validate(ZProblemDriverCode), asyncHandler(ProblemController.addDriverCode))    
    .get(asyncHandler(ProblemController.getDriverCodes))     
    .patch(validate(ZProblemDriverCodeUpdate), asyncHandler(ProblemController.updateDriverCode));     // edit driver code

router.route("/:id")
    .get(asyncHandler(ProblemController.getProblemById))
    .delete(asyncHandler(ProblemController.removeProblem))
    .patch(validate(ZProblem), asyncHandler(ProblemController.updateQuestion));
    
export default router;