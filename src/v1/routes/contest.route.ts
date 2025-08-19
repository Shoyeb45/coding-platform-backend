import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ContestController } from "../controllers/contest.controller";
import { validate } from "../../middlewares/validate.middleware";
import { ZContest, ZContestCreate, ZContestMod, ZContestProblem } from "../types/contest.type";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticateUser);

router.route("/")
    .post(validate(ZContestCreate), asyncHandler(ContestController.createContest))
    .get(asyncHandler(ContestController.getContests));

router.route("/:contestId")
    .patch(validate(ZContest), asyncHandler(ContestController.updateContest))
    .get(asyncHandler(ContestController.getContest));


router.route("/problem/:contestId")
    .get(asyncHandler(ContestController.getAllProblems))
    .post(validate(ZContestProblem), asyncHandler(ContestController.addProblemToContest))
    .delete(validate(ZContestProblem.pick({ problemId: true })), asyncHandler(ContestController.deleteProblemFromContest))

router.route("/moderators/:contestId")
    .post(validate(ZContestMod), asyncHandler(ContestController.addModerator))  // for adding the mods
    .get(asyncHandler(ContestController.getAllModerators))   // for getting all the mods
    .delete(validate(ZContestMod), asyncHandler(ContestController.deleteModerator)) // for deleting the mods

export default router;