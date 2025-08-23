import z from "zod";

export const ZSubmission = z.object({
    problemId: z.string(),
    contestId: z.string().optional(),
    languageId: z.string(),
    code: z.string(),
    submissionTime: z.iso.datetime(),
    languageCode: z.string()
});

export interface TestcaseData {
    id: string;
    weight: number;
    input: string;
    output: string;
    inputName: string;
    outputName: string;
}
export interface SubmissionQueueType {
    studentId: string,
    problemId: string,
    contestId?: string,
    languageId: string,
    languageCode: string,
    userCode: string,
    driverCode: string,
    prelude: string,
    submissionId: string,
    problemPoint: number,
    submittedAt: string,
    testcases: TestcaseData[],
}

export type SubmissionCreate = {
    contestId?: string,
    studentId: string,
    problemId: string, 
    languageId: string,
    code: string,
    status: string,
    executionTime: number,
    memoryUsed: number,
    submittedAt: string,
    score: number
}
export type TSubmission = z.infer<typeof ZSubmission>;