import z from "zod";

export const ZSubmission = z.object({
    problemId: z.string(),
    contestId: z.string().optional(),
    languageId: z.string(),
    code: z.string()
});

export type TSubmission = z.infer<typeof ZSubmission>;