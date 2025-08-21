import z from "zod";

export const ZProblemCreate = z.object({
  title: z.string(),
  createdBy: z.string().optional()
});

export const ZProblem = z.object({
  title: z.string().optional(),
  constraints: z.string().optional(),
  problemStatement: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  isPublic: z.boolean().optional(),
  problemWeight: z.number()
    .int()
    .min(1, "Problem weight must be > 0.")
    .max(100, "Problem weight must be <= 100.")
    .optional(),
  testcaseWeight: z.number()
    .int()
    .min(1, "Testcase weight must be > 0.")
    .max(100, "Testcase weight must be <= 100.")
    .optional(),
  tags: z.array(z.string()).optional()
});

export const ZProblemModerator = z.object({
  problemId: z.string(),
  moderatorIds: z.array(z.string())
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
  difficulty: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z.enum(["Easy", "Medium", "Hard"]).optional()
  ),
});


export const ZProblemDriverCode = z.object({
  languageId: z.string(),
  prelude: z.string(),
  boilerplate: z.string(),
  driverCode: z.string(),
});

export const ZProblemDriverCodeUpdate = ZProblemDriverCode.partial();

export type TProblemDriverUpdate = z.infer<typeof ZProblemDriverCodeUpdate>;
export type TProblemDriver = z.infer<typeof ZProblemDriverCode>;
export type TProblemFilter = z.infer<typeof ZProblemFilter>;
export type TProblem = z.infer<typeof ZProblem>;
export type TProblemUpdate = Omit<TProblem, "tags">
export type TProblemCreate = z.infer<typeof ZProblemCreate>;
export type TProblemModerator = z.infer<typeof ZProblemModerator>;