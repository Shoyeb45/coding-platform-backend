import { NextFunction, Request, Response } from "express";
import { TestcaseService } from "../services/testcase.service";
import { ZTestcaseFilter } from "../types/testcase.type";

export class TestcaseController {
    static getPresignUrl = async (req: Request, res: Response, next: NextFunction) => {
        const problemId = req.params.problemId;
        await TestcaseService.generatePresignedUrl(problemId, req.body, res);
    } 
    
    static getBulkPresignUrl = async (req: Request, res: Response, next: NextFunction) => {
        const problemId = req.params.problemId;
        await TestcaseService.generateBulkPresignedUrl(problemId, req.body, res);
    } 

    static createTestcase = async (req: Request, res: Response, next: NextFunction) => {
        await TestcaseService.createTestcase(req.body, res);
    } 
    static createTestcases = async (req: Request, res: Response, next: NextFunction) => {
        await TestcaseService.createTestcases(req.body, res);
    } 

    static getTestcases = async (req: Request, res: Response, next: NextFunction) => {
        const data = ZTestcaseFilter.safeParse(req.query);
        await TestcaseService.getTestcases(data, res);
    }

    static getAllTestCases = async (req: Request, res: Response, next: NextFunction) => {
        const problemId = req.params.problemId;
        await TestcaseService.getAllTestcases(problemId, res)
    }

    static removeTestcase = async (req: Request, res: Response, next: NextFunction) => {
        const testcaseId = req.params.testcaseId;
        await TestcaseService.removeTestcase(testcaseId, res);
    } 
}