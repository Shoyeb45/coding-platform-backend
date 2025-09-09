import {  Response } from "express";
import { TBulkTestCaseCreate, TTestCaseCreate, TTestCaseEdit, TTestcaseFilter, TTestcases } from "../types/testcase.type";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../config/httpCodes";
import { S3Service } from "../../utils/s3client";
import { ApiResponse } from "../../utils/ApiResponse";
import { TestcaseRepository } from "../repositories/testcase.repository";
import { SafeParseResult } from "zod/v4/core/util.cjs";
import { logger } from "../../utils/logger";
import { cleanObject } from "../../utils/helper";
import { ProblemRepository } from "../repositories/problem.repository";

export class TestcaseService {
    private static authenticateTeacher = (user: Express.Request["user"]) => {
        if (!user?.id) {
            throw new ApiError("No teacher id found");
        }

        if (user.role !== "ASSISTANT_TEACHER" && user.role !== "TEACHER") {
            throw new ApiError("Unauthorized access, only teacher is allowed to modify testcases", HTTP_STATUS.UNAUTHORIZED);
        }
    }

    private static async checkProblem(teacherId: string | undefined, problemId: string) {
        if (!teacherId) {
            throw new ApiError("No teacher id found");
        }
        const problem = await ProblemRepository.getProblemById(problemId);

        if (!problem) {
            throw new ApiError("No problem exist with given id");
        }

        const teacher = problem?.creator?.id === teacherId;
        const moderator = await this.isModeratorAllowed(teacherId, problemId);

        return teacher || moderator;
    }

    private static async isModeratorAllowed(teacherId: string | undefined, problemId: string) {
        if (!teacherId) {
            throw new ApiError("No teacher id found");
        }
        // get all the mods
        const mods = await ProblemRepository.getModerators(problemId);
        for (const mod of mods) {
            if (mod.moderator.id === teacherId) {
                return true;
            }
        }
        return false;
    }

    static generatePresignedUrl = async (user: Express.Request["user"], problemId: string, testcaseData: TTestCaseCreate, res: Response) => {
        this.authenticateTeacher(user);
        if (!problemId.trim()) {
            throw new ApiError("Couldn't find id of the problem to upload the testcases.", HTTP_STATUS.NOT_FOUND);
        }
        if (!(await this.checkProblem(user?.id, problemId))) {
            throw new ApiError("Unauthorized access, you are not allowed to generate presigned url for given problem.", HTTP_STATUS.UNAUTHORIZED);
        }

        const inputKey = `testcases/${problemId}/input/${testcaseData.inputFilename}`;
        const outputKey = `testcases/${problemId}/output/${testcaseData.outputFilename}`;

        const inputUrl = await S3Service.getInstance().generatePresignedUrl(inputKey, "text/plain");
        const outputUrl = await S3Service.getInstance().generatePresignedUrl(outputKey, "text/plain");

        if (!inputUrl || !outputUrl) {
            throw new ApiError("Failed to generate upload url for testcase, please try once again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully generated presigned url", {
                inputUploadUrl: inputUrl, outputUploadUrl: outputUrl
            })
        );
    }


    static generateBulkPresignedUrl = async (user: Express.Request["user"], problemId: string, testcasesData: TBulkTestCaseCreate, res: Response) => {
        this.authenticateTeacher(user);
        if (!problemId.trim()) {
            throw new ApiError("Couldn't find id of the problem to upload the testcases.", HTTP_STATUS.NOT_FOUND);
        }
        if (!(await this.checkProblem(user?.id, problemId))) {
            throw new ApiError("Unauthorized access, you are not allowed to generate presigned url for given problem.", HTTP_STATUS.UNAUTHORIZED);
        }

        const data: { presignedUrls: {inputUploadUrl: string, outputUploadUrl: string}[] }  = { presignedUrls: [] }

        for (const testcase of testcasesData.testcases) {
            const inputKey = `testcases/${problemId}/input/${testcase.inputFilename}`;
            const outputKey = `testcases/${problemId}/output/${testcase.outputFilename}`;

            const inputUploadUrl = await S3Service.getInstance().generatePresignedUrl(inputKey, "text/plain");
            const outputUploadUrl = await S3Service.getInstance().generatePresignedUrl(outputKey, "text/plain");

            if (!inputUploadUrl || !outputUploadUrl) {
                throw new ApiError("Failed to generate upload url for testcase, please try once again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            data.presignedUrls.push({
                inputUploadUrl, outputUploadUrl
            });
        }

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully generated presigned urls for all the testcases.", data)
        );
    }




    static createTestcases = async (user: Express.Request["user"], testcasesData: TTestcases, res: Response) => {
        if (testcasesData.testcases.length <= 0) {
            throw new ApiError("No testcases found to upload in database.");
        }
        this.authenticateTeacher(user);
        if (!(await this.checkProblem(user?.id, testcasesData.testcases[0].problemId))) {
            throw new ApiError("Unauthorized access, you are not allowed to create testcases in database.", HTTP_STATUS.UNAUTHORIZED);
        }

        testcasesData.testcases = testcasesData.testcases.map((testcase) => {
            return {
                ...testcase,
                input: `testcases/${testcase.problemId}/input/${testcase.input}`,
                output: `testcases/${testcase.problemId}/output/${testcase.output}`,
            }
        });

        const createdTestcase = await TestcaseRepository.createTestcases(testcasesData);
        if (!createdTestcase) {
            throw new ApiError("Failed to upload testcases, please try again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const data = await TestcaseRepository.getTestcasesOfProblem(testcasesData.testcases[0]?.problemId);
        if (!data) {
            throw new ApiError("Failed to create all the testcases, please do it once again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully uploaded metadata of testcases in database", data)
        );
    }

    static getTestcases = async (filterData: SafeParseResult<TTestcaseFilter>, res: Response) => {
        if (!filterData.success) {
            throw new ApiError("No problem id found", 500);
        }

        const data = await TestcaseRepository.getTestcases(filterData.data);
        if (!data) {
            throw new ApiError("Failed to get all the testcases.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Testcases found successfully.", data)
        );
    }

    static getAllTestcases = async (user: Express.Request["user"], problemId: string, res: Response) => {
        this.authenticateTeacher(user);
        if (!problemId) {
            throw new ApiError("No problem id found", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
        if (!(await this.checkProblem(user?.id, problemId))) {
            throw new ApiError("Unauthorized access, you are not allowed to see all the hidden testcases.", HTTP_STATUS.UNAUTHORIZED);
        }
        

        const data = await TestcaseRepository.getTestcasesOfProblem(problemId);
        if (!data) {
            throw new ApiError("Failed to get all the testcases.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const urls: { inputUrl: string, outputUrl: string }[] = [];

        for (const d of data) {
            const inUrl = await S3Service.getInstance().getPreviewPresignedUrl(d.input);
            const outUrl = await S3Service.getInstance().getPreviewPresignedUrl(d.output);
            if (!inUrl || !outUrl) {
                throw new ApiError("Failed to fetch all the testcases", HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }

            urls.push({
                inputUrl: inUrl, outputUrl: outUrl
            });
        }

        const newData = data.map((d, idx) => ({
            ...d, input: {
                key: d.input,
                url: urls[idx].inputUrl
            }, output: {
                key: d.output,
                url: urls[idx].outputUrl
            }
        }));

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("All testcases fetched successfully", newData)
        );
    }


    private static async checkTestcase(teacherId: string | undefined, testcaseId: string) {
        if (!teacherId) {
            throw new ApiError("No teacher id found");
        }

        const data = await TestcaseRepository.getTestcaseOwner(testcaseId);
        if (!data) {
            throw new ApiError("No testcase found with given id.");
        }

        const teacher = data.problem.creator?.id === teacherId;
        let moderator = false;
        // now check moderators
        for (const mod of data.problem.problemModerators) {
            if (mod.id === teacherId) {
                moderator = true
                break;
            }
        
        }
        if (!(teacher || moderator)) {
            throw new ApiError("Unauthorized access, you are not allowed to perform changes on testcases.");
        }
    }

    static removeTestcase = async (user: Express.Request["user"], testcaseId: string, res: Response) => {
        this.authenticateTeacher(user);
        if (!testcaseId) {
            throw new ApiError("No testcase id found.", HTTP_STATUS.BAD_REQUEST);
        }

        await this.checkTestcase(user?.id, testcaseId);

        const removedTestcase = await TestcaseRepository.remove(testcaseId);
        if (!removedTestcase) {
            throw new ApiError("Failed to remove testcase", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        logger.info("Deleting from S3");
        await S3Service.getInstance().deleteObject(removedTestcase.input);
        await S3Service.getInstance().deleteObject(removedTestcase.output);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully deleted testcase", { testcase: removedTestcase })
        );
    }

    static getSampleTestcases = async (problemId: string) => {
        if (!problemId) {
            throw new ApiError("No problem id found.", HTTP_STATUS.BAD_REQUEST);
        }
        if (!(await ProblemRepository.getProblemById(problemId))) {
            throw new ApiError("No problem found with given id", HTTP_STATUS.BAD_REQUEST);
        }

        const testcases = await TestcaseRepository.getTestcases({ problemId, isSample: true });

        if (!testcases) {
            throw new ApiError("Failed to fetch sample testcases from database.");
        }

        const data = await Promise.all(
            testcases.map(async (testcase) => ({
                ...testcase,
                input: await S3Service.getInstance().getFileContent(testcase.input),
                output: await S3Service.getInstance().getFileContent(testcase.output),
            }))
        );

        return data;
    }

    static editTestcase = async (user: Express.Request["user"], testcaseId: string, testcaseInfo: TTestCaseEdit) => {
        this.authenticateTeacher(user);
        if (!testcaseId) {
            throw new ApiError("No testcase id found.", HTTP_STATUS.BAD_REQUEST);
        }
        await this.checkTestcase(user?.id, testcaseId);

        const testcases = await TestcaseRepository.update(testcaseId, cleanObject(testcaseInfo));

        if (!testcases) {
            throw new ApiError("Failed to fetch update given testcase.");
        }

        return testcases;

    }

    static getTestcase = async (user: Express.Request["user"], testcaseId: string) => {
        this.authenticateTeacher(user);
        if (!testcaseId) {
            throw new ApiError("Testcase id not found", HTTP_STATUS.BAD_REQUEST);
        }

        const data = await TestcaseRepository.getTestcaseById(testcaseId);

        if (!data) {
            throw new ApiError("Failed to fetch testcase, please try again.");
        }
        // replace input and output keys with actual testcase         
        data.input = await S3Service.getInstance().getFileContent(data.input);
        data.output = await S3Service.getInstance().getFileContent(data.output);

        return data;
    }
}