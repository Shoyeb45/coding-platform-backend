import z from "zod";

export const ZTestcaseCreate = z.object({
  inputFilename: z.string()
    .min(4, { message: "Atleast minimum length of 1 is required for input filename." })
    .refine(
      (name) => name.toLowerCase().endsWith('.txt'),
      { message: "Input file must be a text(.txt) file" }
    ),

  outputFilename: z.string()
    .min(4, { message: "Atleast minimum length of 1 is required for output filename." })
    .refine(
      (name) => name.toLowerCase().endsWith('.txt'),
      { message: "Output file must have a text(.txt) extension" }
    ),
}).refine(
  (data) => data.inputFilename !== data.outputFilename,
  { message: "Input and output filenames must be different" }
);


export const ZBulkTestcaseCreate = z.object({
  testcases: z.array(ZTestcaseCreate)
    .min(1, { message: "At least one test case is required" })
});

export const ZTestcase = z.object({
  problemId: z.string(),
  input: z.string(),
  output: z.string(),
  isSample: z.boolean().default(false),
  points: z.int32().default(0),
  explanation: z.string().default("")
});

export const ZTestcases = z.object({
  testcases: z.array(ZTestcase)
    .min(1, { message: "At least one test case is required." })
});

export const ZTestcaseFilter = z.object({
    problemId: z.string(),
    isSample: z.boolean().default(true)
});

export type TTestcaseFilter = z.infer<typeof ZTestcaseFilter>;
export type TTestcase = z.infer<typeof ZTestcase>;
export type TTestcases = z.infer<typeof ZTestcases>;
export type TTestCaseCreate = z.infer<typeof ZTestcaseCreate>;
export type TBulkTestCaseCreate = z.infer<typeof ZBulkTestcaseCreate>;