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
  problemWeight: z.number()
    .int()
    .min(0, "Problem weight must be >= 0.")
    .max(100, "Problem weight must be <= 100.")
    .optional(),
  testcaseWeight: z.number()
    .int()
    .min(0, "Testcase weight must be >= 0.")
    .max(100, "Testcase weight must be <= 100.")
    .optional(),
  tags: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.problemWeight && data.testcaseWeight && data.problemWeight + data.testcaseWeight !== 100) {
    ctx.addIssue({
      code: "custom",
      message: "The sum of testcase weight and problem weight can be upto 100.",
      path: ["testcaseWeight"]
    });
  }
}
);

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