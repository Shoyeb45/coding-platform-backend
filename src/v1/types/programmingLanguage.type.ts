import z from "zod";

export const ZLanguageCreate = z.object({
    name: z.string(),
    judge0Code: z.int32()
});

export type TLanguageCreate = z.infer<typeof ZLanguageCreate>;