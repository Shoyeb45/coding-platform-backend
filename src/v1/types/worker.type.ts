export interface CodeRunnerResult {
  runId: string,
  totalTestCases: number;
  passedTestCases: number;
  results: Array<{
    id?: string,
    status: string;
    output: string;
    compilerError?: string;
    runtimeError?: string;
    executionTime?: number;
    memory?: number;
    weight?: number;
    passed: boolean;
  }>;
}


export interface SubmissionRunnerResult {
  problemPoint: number,
  runnerResult: CodeRunnerResult,
  metadata: {
    problemId: string,
    studentId: string,
    contestId?: string,
    languageId: string,
    code: string,
    submittedAt: string
  }
}