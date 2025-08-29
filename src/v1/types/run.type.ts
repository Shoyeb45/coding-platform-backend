import z from "zod";

export const ZCustomRun = z.object({
    problemId: z.string(),
    testCases: z.array(z.object({
        input: z.string(),
        output: z.string(),
    })),
    code: z.string(),
    languageId: z.string(),
    languageCode: z.string()
});

export type TCustomRun = z.infer<typeof ZCustomRun>;