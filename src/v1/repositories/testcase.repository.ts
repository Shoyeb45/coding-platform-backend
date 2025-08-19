import { prisma } from "../../utils/prisma";
import { TTestcase, TTestCaseEdit, TTestcaseFilter, TTestcases } from "../types/testcase.type"

export class TestcaseRepository {
    static getTestcaseById = async (id: string) => {
        return await prisma.testCase.findFirst({ where: { id }, select: {
            id: true, isSample: true, input: true, output: true, weight: true, explanation: true
        }})
    }

    static getTestcaseOwner = async (id: string) => {
        return await prisma.testCase.findFirst({ where: { id }, select: {
            id: true, isSample: true, input: true, output: true, weight: true, explanation: true, problem: {
                select: {
                    problemModerators: {
                        select: { id: true }
                    },
                    creator: {
                        select: { id: true }
                    }
                }
            }
        }})
    } 

    static create = async (data: TTestcase) => {
        return await prisma.testCase.create({ data });
    }


    static update = async (testcaseId: string, data: TTestCaseEdit) => {
        return await prisma.testCase.update({
            where: { id: testcaseId },
            data
        });
    }
    static getTestcasesOfProblem = async (problemId: string) => {
        const rawData = await prisma.testCase.findMany({
            where: {
                problemId
            },
            select: {
                id: true, isSample: true, input: true, output: true, weight: true, explanation: true
            }
        })
        return rawData;
    }

    static getTestcases = async (where: TTestcaseFilter) => {
        const result = await prisma.testCase.findMany({
            where,
            select: {
                id: true, isSample: true, input: true, output: true, weight: true, explanation: true
            }
        });
        return result;
    }
    static createTestcases = async (data: TTestcases) => {
        return await prisma.testCase.createMany({ data: data.testcases });
    }

    static remove = async (testcaseId: string) => {
        const removedTestcase = await prisma.testCase.delete({ where: { id: testcaseId }});
        return removedTestcase;
    }
}