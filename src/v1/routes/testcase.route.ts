import { Router } from "express";
import { TestcaseController } from "../controllers/testcase.controller";
import { ZBulkTestcaseCreate, ZTestcase, ZTestcaseCreate, ZTestCaseEdit, ZTestcases } from "../types/testcase.type";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.route("/:problemId/presign")
    .post(validate(ZTestcaseCreate), asyncHandler(TestcaseController.getPresignUrl));
    
router.route("/:problemId/bulk-presign")
    .post(validate(ZBulkTestcaseCreate), asyncHandler(TestcaseController.getBulkPresignUrl));

router.route("/:testcaseId")
    .delete(asyncHandler(TestcaseController.removeTestcase))
    .patch(validate(ZTestCaseEdit), asyncHandler(TestcaseController.editTestcase));
    
router.route("/")
    .post(validate(ZTestcases), asyncHandler(TestcaseController.createTestcases));

router.route("/:problemId")
    .get(asyncHandler(TestcaseController.getAllTestCases));

router.route("/sample/:problemId")
    .get(asyncHandler(TestcaseController.getSampleTestCase));

export default router;
