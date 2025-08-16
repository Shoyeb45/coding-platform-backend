export interface Judge0ExecutionRequest {
  code: string;
  languageId: string;
  input: string;
  expectedOutput: string;
}

export interface Judge0ExecutionResult {
  status: string;
  output: string;
  error?: string;
  time?: number;
  compileError?: string,
  memory?: number;
}