import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from "./../config/index";
import { Judge0ExecutionRequest, Judge0ExecutionResult } from '../v1/types/judge0.type';


function getCpuTimeLimit(languageId: string) {
  if (languageId === "105" || languageId === "103") {
    return 2;  // for cpp and c
  } else if (languageId === "91") {
    return 4;  // for java
  } 
  return 5; // for js and python
}



export async function executeCodeWithJudge0(request: Judge0ExecutionRequest): Promise<Judge0ExecutionResult> {
  try {
    const submissionData = {
      source_code: Buffer.from(request.code).toString('base64'),
      language_id: request.languageId,
      stdin: Buffer.from(request.input || '').toString('base64'),
      cpu_time_limit: getCpuTimeLimit(request.languageId),
      wall_time_limit: getCpuTimeLimit(request.languageId) * 3
    };

    const response = await axios.post(
      `${config.judge0ApiUrl}/submissions?base64_encoded=true&wait=true`,
      submissionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': config.judge0ApiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    const submission = response.data;

    return {
      status: submission.status.description,
      output: submission.stdout ? Buffer.from(submission.stdout, 'base64').toString() : '',
      error: submission.stderr ? Buffer.from(submission.stderr, 'base64').toString() : undefined,
      time: submission.time,
      compileError: submission.compile_output ? Buffer.from(submission.compile_output, 'base64').toString(): undefined,
      memory: submission.memory,
    };

  } catch (error: any) {
    logger.error('Judge0 API error:', error);
    throw new Error(`Execution failed: ${error.message}`);
  }
}