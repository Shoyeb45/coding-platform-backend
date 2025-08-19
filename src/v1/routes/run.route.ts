import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZCustomRun } from "../types/run.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { RunController } from "../controllers/run.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();



router.route("/")
    .post(authenticateUser, validate(ZCustomRun), asyncHandler(RunController.customRun));
    
router.route("/:runId")
    .get(asyncHandler(RunController.getRunResult));

export default router;