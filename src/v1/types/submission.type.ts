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
    code: string,
    submissionId: string,
    submittedAt: string,
    testcases: TestcaseData[],
}

export type TSubmission = z.infer<typeof ZSubmission>;