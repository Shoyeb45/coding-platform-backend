import { NextFunction, Request, Response } from "express";
import { TestcaseService } from "../services/testcase.service";
import { ZTestcaseFilter } from "../types/testcase.type";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";

export class TestcaseController {
    static getPresignUrl = async (req: Request, res: Response, next: NextFunction) => {
        const problemId = req.params.problemId;
        await TestcaseService.generatePresignedUrl(problemId, req.body, res);
    } 
    
    static getBulkPresignUrl = async (req: Request, res: Response, next: NextFunction) => {
        const problemId = req.params.problemId;
        await TestcaseService.generateBulkPresignedUrl(problemId, req.body, res);
    } 


    static createTestcases = async (req: Request, res: Response, next: NextFunction) => {
        await TestcaseService.createTestcases(req.body, res);
    } 

    static getTestcases = async (req: Request, res: Response, next: NextFunction) => {
        const data = ZTestcaseFilter.safeParse(req.query);
        await TestcaseService.getTestcases(data, res);
    }

    static getTestcase = async (req: Request, res: Response, next: NextFunction) => {
        const testcaseId = req.params.testcaseId;
        const data = await TestcaseService.getTestcase(testcaseId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched the testcase", data)
        );
    }

    static getAllTestCases = async (req: Request, res: Response, next: NextFunction) => {
        const problemId = req.params.problemId;
        await TestcaseService.getAllTestcases(problemId, res)
    }

    static removeTestcase = async (req: Request, res: Response, next: NextFunction) => {
        const testcaseId = req.params.testcaseId;
        await TestcaseService.removeTestcase(testcaseId, res);
    } 

    static getSampleTestCase = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        const data = await TestcaseService.getSampleTestcases(problemId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched all the testcases", data)
        );
    }

    static editTestcase = async (req: Request, res: Response) => {
        const testcaseId = req.params.testcaseId;
        const updatedTestcase = await TestcaseService.editTestcase(testcaseId, req.body);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully updated given testcase.", { updatedTestcase })
        );
    }
}