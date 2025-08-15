import { Request, Response } from "express";
import { TBulkTestCaseCreate, TTestcase, TTestCaseCreate, TTestcaseFilter, TTestcases } from "../types/testcase.type";
import { ApiError } from "../../utils/ApiError";
import { HTTP_STATUS } from "../../config/httpCodes";
import { S3Service } from "../../utils/s3client";
import { ApiResponse } from "../../utils/ApiResponse";
import { TestcaseRepository } from "../repositories/testcase.repository";
import { SafeParseResult } from "zod/v4/core/util.cjs";

export class TestcaseService {
    static generatePresignedUrl = async (problemId: string, testcaseData: TTestCaseCreate, res: Response) => {
        if (!problemId.trim()) {
            throw new ApiError("Couldn't find id of the problem to upload the testcases.", HTTP_STATUS.NOT_FOUND);
        }
        const inputKey = `problems/${problemId}/input/${testcaseData.inputFilename}`;
        const outputKey = `problems/${problemId}/output/${testcaseData.outputFilename}`;

        const inputUrl = await S3Service.getInstance().generatePresignedUrl(inputKey, "text/plain");
        const outputUrl = await S3Service.getInstance().generatePresignedUrl(outputKey, "text/plain");

        if (!inputUrl || !outputUrl) {
            throw new ApiError("Failed to generate upload url for testcase, please try once again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully generated presigned url", {
                inputUploadUrl: inputUrl, outputUploadUrl: outputKey
            })
        );
    }


    static generateBulkPresignedUrl = async (problemId: string, testcasesData: TBulkTestCaseCreate, res: Response) => {
        if (!problemId.trim()) {
            throw new ApiError("Couldn't find id of the problem to upload the testcases.", HTTP_STATUS.NOT_FOUND);
        }

        const data = { presignedUrls: [{}] }

        for (const testcase of testcasesData.testcases) {
            const inputKey = `problems/${problemId}/input/${testcase.inputFilename}`;
            const outputKey = `problems/${problemId}/output/${testcase.outputFilename}`;

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

    static createTestcase = async (testcaseData: TTestcase, res: Response) => {
        const createdTestcase = await TestcaseRepository.create(testcaseData);
        if (!createdTestcase) {
            throw new ApiError("Failed to upload testcase, please try again.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse("Successfully uploaded metadata of testcase in database", { testcaseId: createdTestcase.id })
        );
    }


    static createTestcases = async (testcasesData: TTestcases, res: Response) => {
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
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("All testcases fetched successfully", data)
        );
    }

    static removeTestcase = async (testcaseId: string, res: Response) => {
        if (!testcaseId) {
            throw new ApiError("No testcase id found.", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const removedTestcase = await TestcaseRepository.remove(testcaseId);
        if (!removedTestcase) {
            throw new ApiError("Failed to remove testcase", HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        // TODO: Delete from s3
  
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully deleted testcase", { testcase: removedTestcase })
        );
    } 
}