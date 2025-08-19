import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import { ZTag } from "../types/tag.type";
import { TagController } from "../controllers/tag.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authenticateUser);

router.route("/")
    .post(validate(ZTag), asyncHandler(TagController.createTag))
    .get(asyncHandler(TagController.getAllTag));

router.route("/:id")
    .get(asyncHandler(TagController.getTagById))
    .put(validate(ZTag), asyncHandler(TagController.updateTag))
    .delete(asyncHandler(TagController.deleteTag));

export default router;