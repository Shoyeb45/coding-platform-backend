import z from "zod";

export const ZProblemCreate = z.object({
    title: z.string(),
    createdBy: z.string()
});

export const ZProblem = z.object({
    title: z.string().optional(),
    constraints: z.string().optional(),
    problemStatement: z.string().optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
    isPublic: z.boolean().optional(),
    points: z.number().optional(),
    tags: z.string().optional()
});

export const ZProblemModerator = z.object({
  problemId: z.string(),
  moderatorId: z.string()
});


export const ZProblemFilter = z.object({
  isActive: z.preprocess(
    (val) => (val === "true" ? true : val === "false" ? false : val),
    z.boolean().optional().default(true)
  ),
  isPublic: z.preprocess(
    (val) => (val === "true" ? true : val === "false" ? false : val),
    z.boolean().optional().default(false)
  ),
  createdBy: z.string().optional(),
  difficulty: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z.enum(["Easy", "Medium", "Hard"]).optional()
  ),
});

export type TProblemFilter = z.infer<typeof ZProblemFilter>;
export type TProblem = z.infer<typeof ZProblem>;
export type TProblemUpdate = Omit<TProblem, "tags">
export type TProblemCreate = z.infer<typeof ZProblemCreate>;
export type TProblemModerator = z.infer<typeof ZProblemModerator>;