import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';
import { config } from "./../config/index";
import { Judge0ExecutionRequest, Judge0ExecutionResult } from '../v1/types/judge0.type';
import { convertToBase64 } from '../utils/helper';


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
      expected_output: convertToBase64(request.expectedOutput),
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
          // 'X-RapidAPI-Key': config.judge0ApiKey,
          // 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
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
      compileError: submission.compile_output ? Buffer.from(submission.compile_output, 'base64').toString() : undefined,
      memory: submission.memory,
    };

  } catch (error: any) {
    logger.error('Judge0 API error:', error);
    throw new Error(`Execution failed: ${error.message}`);
  }
}

export async function batchSubmissionWithJudge0(languageId: string, code: string, testcases: {
  input: string, output: string
}[]): Promise<Judge0ExecutionResult[]> {
  try {
    const submissions = testcases.map((testcase) => ({
      language_id: languageId,
      source_code: Buffer.from(code).toString('base64'),
      stdin: Buffer.from(testcase.input).toString('base64'),
      expected_output: convertToBase64(testcase.output),
      cpu_time_limit: getCpuTimeLimit(languageId),
      wall_time_limit: getCpuTimeLimit(languageId) * 3
    }));

    
    // Step 1: Submit batch
    const submitResponse = await axios.post(
      `${config.judge0ApiUrl}/submissions/batch?base64_encoded=true&wait=true`,
      { submissions },
      {
        headers: {
          'Content-Type': 'application/json',
          // 'X-RapidAPI-Key': config.judge0ApiKey,
          // 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        timeout: 30000,
      }
    );

    logger.info("Successfully submitted, got tokens");
    const tokens = submitResponse.data.map((submission: any) => submission.token);
    logger.info(`Submitted batch of ${tokens.length} submissions`);

    // Step 2: Poll for results with adaptive timing
    const results = await pollBatchResults(tokens, testcases.length);

    return results.map((submission: any) => ({
      status: submission.status.description,
      output: submission.stdout ? Buffer.from(submission.stdout, 'base64').toString() : '',
      error: submission.stderr ? Buffer.from(submission.stderr, 'base64').toString() : undefined,
      time: submission.time,
      compileError: submission.compile_output ? Buffer.from(submission.compile_output, 'base64').toString() : undefined,
      memory: submission.memory,
    }));

  } catch (error: any) {
    if (error instanceof AxiosError) {
      console.log(error.message)
    }
    logger.error(`Judge0 Batch API error: ${error.message}`);
    throw error;
  }
}

async function pollBatchResults(tokens: string[], batchSize: number): Promise<any[]> {
  const maxAttempts = Math.max(15, batchSize); // Scale with batch size
  const baseInterval = 2000; // Start with 2 second
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const tokensParam = tokens.join(',');
      const response = await axios.get(
        `${config.judge0ApiUrl}/submissions/batch?tokens=${tokensParam}&base64_encoded=true`,
        {
          headers: {
            // 'X-RapidAPI-Key': config.judge0ApiKey,
            // 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
          timeout: 30000,
        }
      );

      const submissions = response.data.submissions;
      
      // Check completion status
      const completedCount = submissions.filter((s: any) => 
        s.status.id !== 1 && s.status.id !== 2
      ).length;
      
      logger.debug(`Batch progress: ${completedCount}/${submissions.length} completed`);

      if (completedCount === submissions.length) {
        logger.info(`Batch completed after ${attempt + 1} polls`);
        return submissions;
      }

      // Adaptive polling interval - increase over time
      const pollInterval = Math.min(baseInterval * (1 + attempt * 0.2), 3000);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
    } catch (error) {
      logger.error(`Polling attempt ${attempt + 1} failed: ${error}`);
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      // Wait longer before retrying on error
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error(`Batch polling timeout: Results not ready after ${maxAttempts} attempts`);
}