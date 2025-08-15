import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZCustomRun } from "../types/run.type";
import { asyncHandler } from "../../utils/asyncHandler";
import { RunController } from "../controllers/run.controller";

const router = Router();

router.route("/")
    .post(validate(ZCustomRun), asyncHandler(RunController.customRun));
    
export default router;