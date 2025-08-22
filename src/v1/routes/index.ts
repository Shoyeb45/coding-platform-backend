import { Router } from "express";
import contestRouter from "./contest.route";
import problemRouter from "./problem.route";
import tagRouter from "./tag.route";
import testcaseRouter from "./testcase.route";
import runRouter from "./run.route";
import submissionRoter from "./submission.route";
import languageRouter from "./language.route";
import studentRouter from "./student.route";

export const router = Router();

router.use("/contests", contestRouter);
router.use("/problems", problemRouter);
router.use("/tags", tagRouter);
router.use("/testcases", testcaseRouter);
router.use("/run", runRouter);
router.use("/submissions", submissionRoter);
router.use("/languages", languageRouter);
router.use("/students", studentRouter);