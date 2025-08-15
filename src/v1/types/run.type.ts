import z from "zod";

export const ZCustomRun = z.object({
    problemId: z.string(),
    input: z.array(z.string()),
    output: z.array(z.string()),
    code: z.string(),
    languageId: z.string()
});

export type TCustomRun = z.infer<typeof ZCustomRun>;