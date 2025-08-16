import z from "zod";

export const ZContestCreation = z.object({
    name: z.string(),
    description: z.string(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    createBy: z.string() 
});

export type TContestCreation = z.infer<typeof ZContestCreation>