import { prisma } from "../../utils/prisma";
import { SubmissionCreate } from "../types/submission.type";

export class SubmissionRepository {
    static createSubimssion = async (data: SubmissionCreate) => {
        return await prisma.submission.create({
            data, select: {
                id: true
            }
        });
    }


    static createSubmissionResults = async (data: {
        submissionId: string;
        testCaseId: string;
        status: string;
        executionTime: number;
        memoryUsed: number;
    }[]) => {
        return await prisma.submissionResult.createMany({ 
            data: data 
        });
    }

    static getSubmissionHistory = async (problemId: string, studentId: string) => {
        const data = await prisma.submission.findMany({
            where: {
                problemId, studentId
            }, 
            select: {
                id: true,
                status: true, language: {
                    select: {
                        id: true, name: true
                    }
                }, executionTime: true, submittedAt: true, code: true, memoryUsed: true
            }
        });
        return data;
    }
}