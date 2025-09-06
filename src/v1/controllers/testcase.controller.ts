import {  Request, Response } from "express";
import { TestcaseService } from "../services/testcase.service";
import { ZTestcaseFilter } from "../types/testcase.type";
import { HTTP_STATUS } from "../../config/httpCodes";
import { ApiResponse } from "../../utils/ApiResponse";

export class TestcaseController {
    static getPresignUrl = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        await TestcaseService.generatePresignedUrl(req.user, problemId, req.body, res);
    } 
    
    static getBulkPresignUrl = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        await TestcaseService.generateBulkPresignedUrl(req.user, problemId, req.body, res);
    } 


    static createTestcases = async (req: Request, res: Response) => {
        await TestcaseService.createTestcases(req.user, req.body, res);
    } 

    static getTestcases = async (req: Request, res: Response) => {
        const data = ZTestcaseFilter.safeParse(req.query);
        await TestcaseService.getTestcases(data, res);
    }

    static getTestcase = async (req: Request, res: Response) => {
        const testcaseId = req.params.testcaseId;
        const data = await TestcaseService.getTestcase(req.user, testcaseId);
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully fetched the testcase", data)
        );
    }

    static getAllTestCases = async (req: Request, res: Response) => {
        const problemId = req.params.problemId;
        await TestcaseService.getAllTestcases(req.user, problemId, res)
    }

    static removeTestcase = async (req: Request, res: Response) => {
        const testcaseId = req.params.testcaseId;
        await TestcaseService.removeTestcase(req.user, testcaseId, res);
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
        const updatedTestcase = await TestcaseService.editTestcase(req.user, testcaseId, req.body);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse("Successfully updated given testcase.", { updatedTestcase })
        );
    }
}