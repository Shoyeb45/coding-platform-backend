import { Router } from "express";
import { TestcaseController } from "../controllers/testcase.controller";
import { ZBulkTestcaseCreate, ZTestcase, ZTestcaseCreate, ZTestcases } from "../types/testcase.type";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.route("/:problemId/presign")
    .post(validate(ZTestcaseCreate), asyncHandler(TestcaseController.getPresignUrl));

    
router.route("/:problemId/bulk-presign")
    .post(validate(ZBulkTestcaseCreate), asyncHandler(TestcaseController.getBulkPresignUrl));

router.route("/:testcaseId")
    .delete(asyncHandler(TestcaseController.removeTestcase));
    
router.route("/")
    .post(validate(ZTestcase), asyncHandler(TestcaseController.createTestcase))
    .get(asyncHandler(TestcaseController.getTestcases));

router.route("/all/:problemId")
    .get(asyncHandler(TestcaseController.getAllTestCases));

router.route("/bulk")
    .post(validate(ZTestcases), asyncHandler(TestcaseController.createTestcases));
    
export default router;
