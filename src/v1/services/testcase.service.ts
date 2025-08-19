import { Request, Response } from "express";
import { TBulkTestCaseCreate, TTestcase, TTestCaseCreate, TTestCaseEdit, TTestcaseFilter, TTestcases } from "../types/testcase.type";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../config/httpCodes";
import { S3Service } from "../../utils/s3client";
import { ApiResponse } from "../../utils/ApiResponse";
import { TestcaseRepository } from "../repositories/testcase.repository";
import { SafeParseResult } from "zod/v4/core/util.cjs";
import { logger } from "../../utils/logger";
import { cleanObject } from "../../utils/cleanObject";

export class TestcaseService {
    static generatePresignedUrl = async (problemId: string, testcaseData: TTestCaseCreate, res: Response) => {
        if (!problemId.trim()) {
            throw new ApiError("Couldn't find id of the problem to upload the testcases.", HTTP_STATUS.NOT_FOUND);
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


    static generateBulkPresignedUrl = async (problemId: string, testcasesData: TBulkTestCaseCreate, res: Response) => {
        if (!problemId.trim()) {
            throw new ApiError("Couldn't find id of the problem to upload the testcases.", HTTP_STATUS.NOT_FOUND);
        }

        const data = { presignedUrls: [{}] }

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




    static createTestcases = async (testcasesData: TTestcases, res: Response) => {
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

    static getAllTestcases = async (problemId: string, res: Response) => {
        if (!problemId) {
            throw new ApiError("No problem id found", HTTP_STATUS.INTERNAL_SERVER_ERROR);
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


    static removeTestcase = async (testcaseId: string, res: Response) => {
        if (!testcaseId) {
            throw new ApiError("No testcase id found.", HTTP_STATUS.BAD_REQUEST);
        }

        logger.info("Deleted testcases from DB.");

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

    // TODO: complete
    static getSampleTestcases = async (problemId: string) => {
        if (!problemId) {
            throw new ApiError("No problem id found.", HTTP_STATUS.BAD_REQUEST);
        }
        let testcases = await TestcaseRepository.getTestcases({ problemId, isSample: true });

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

    static editTestcase = async (testcaseId: string, testcaseInfo: TTestCaseEdit) => {
        if (!testcaseId) {
            throw new ApiError("No testcase id found.", HTTP_STATUS.BAD_REQUEST);
        }
        const testcases = await TestcaseRepository.update(testcaseId, cleanObject(testcaseInfo));

        if (!testcases) {
            throw new ApiError("Failed to fetch update given testcase.");
        }

        return testcases;

    }

    static getTestcase = async (testcaseId: string) => {
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