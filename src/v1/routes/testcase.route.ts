import { Router } from "express";
import { TestcaseController } from "../controllers/testcase.controller";
import { ZBulkTestcaseCreate, ZTestcaseCreate, ZTestCaseEdit, ZTestcases } from "../types/testcase.type";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.route("/:problemId/presign")
    .post(authenticateUser, validate(ZTestcaseCreate), asyncHandler(TestcaseController.getPresignUrl));
    
router.route("/:problemId/bulk-presign")
    .post(authenticateUser, validate(ZBulkTestcaseCreate), asyncHandler(TestcaseController.getBulkPresignUrl));

router.route("/:testcaseId")
    .delete(authenticateUser, asyncHandler(TestcaseController.removeTestcase))
    .patch(authenticateUser, validate(ZTestCaseEdit), asyncHandler(TestcaseController.editTestcase));
    
router.route("/")
    .post(authenticateUser, validate(ZTestcases), asyncHandler(TestcaseController.createTestcases));

router.route("/all/:problemId")
    .get(authenticateUser, asyncHandler(TestcaseController.getAllTestCases));

router.route("/:testcaseId")
    .get(authenticateUser, asyncHandler(TestcaseController.getTestcase));

router.route("/sample/:problemId")
    .get(asyncHandler(TestcaseController.getSampleTestCase));

export default router;
