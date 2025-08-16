import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ContestController } from "../controllers/contest.controller";
import { validate } from "../../middlewares/validate.middleware";
import { ZContestCreation } from "../types/contest.type";

const router = Router();

router.post("/", validate(ZContestCreation), asyncHandler(ContestController.createContest));

export default router;