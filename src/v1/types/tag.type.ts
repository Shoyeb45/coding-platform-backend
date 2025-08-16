import z from "zod";

export const ZTag = z.object({ name: z.string() });

export type TTag = z.infer<typeof ZTag>;

