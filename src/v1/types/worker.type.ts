export interface CodeRunnerResult {
  runId: string,
  totalTestCases: number;
  passedTestCases: number;
  results: Array<{
    status: string;
    output: string;
    compilerError?: string;
    runtimeError?: string;
    executionTime?: number;
    memory?: number;
    passed: boolean;
  }>;
}