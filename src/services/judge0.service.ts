import axios from 'axios';
import { logger } from '../utils/logger';
import dotenv from "dotenv";



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
  memory?: number;
}

export async function executeCodeWithJudge0(request: Judge0ExecutionRequest): Promise<Judge0ExecutionResult> {
  try {
    const submissionData = {
      source_code: Buffer.from(request.code).toString('base64'),
      language_id: request.languageId,
      stdin: Buffer.from(request.input || '').toString('base64'),
    };
    
    const response = await axios.post(
      `${judge0Url}/submissions?base64_encoded=true&wait=true`,
      submissionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': judge0Api,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        timeout: 30000, // 30 second timeout
      }
    );
    
    const submission = response.data;
    console.log(submission);
    
    return {
      status: submission.status.description,
      output: submission.stdout ? Buffer.from(submission.stdout, 'base64').toString() : '',
      error: submission.stderr ? Buffer.from(submission.stderr, 'base64').toString() : undefined,
      time: submission.time,
      memory: submission.memory,
    };
    
  } catch (error: any) {
    logger.error('Judge0 API error:', error);
    throw new Error(`Execution failed: ${error.message}`);
  }
}