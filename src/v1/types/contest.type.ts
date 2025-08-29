import z from "zod";

export const ZContestCreate = z.object({
    title: z.string().min(1, "The contest name should contain at least 1 character."),
});

export const ZContest = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    startTime: z.iso.datetime().optional(),
    batches: z.array(z.string()).optional(),
    isOpen: z.boolean().default(false),
    moderators: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
    endTime: z.iso.datetime().optional(),
    languages: z.array(z.string()).optional(),
    subjectId: z.string().optional()
});

export const ZContestProblem = z.object({
    problems: z.array(z.object({
        problemId: z.string(),
        point: z.int32().min(1, "Atleast 1 point should be there for problem.").max(10, "Atmost 10 point is there for problem.")
    }))
});

export const ZContestMod = z.object({
    moderatorIds: z.array(z.string()) 
});

export const ZProblemContestEdit = z.object({
    point: z.int32().min(1, "Atleast 1 point should be there for problem.").max(10, "Atmost 10 point is there for problem."),
    contestId: z.string()
})

export type TProblemContestEdit = z.infer<typeof ZProblemContestEdit>;
export type TContestMod = z.infer<typeof ZContestMod>;
export type TContestProblem = z.infer<typeof ZContestProblem>;
export type TContest = z.infer<typeof ZContest>
export type TContestCreate = z.infer<typeof ZContestCreate>