import { logger } from '../utils/logger';
import { executeCodeWithJudge0 } from '../services/judge0.service';
import { Worker, Job } from "bullmq";
import { redisConfig } from '../config/queue.config';
import { QueueDataType } from '../v1/types/queue.type';
import { CodeRunnerResult } from '../v1/types/worker.type';
import { RedisClient } from '../utils/redisClient';

// custom code runner
export const codeRunnerWorker = new Worker<QueueDataType, CodeRunnerResult>(
  'code-execution',
  async (job: Job<QueueDataType>) => {
    const { code, languageCode, testCases, problemId, runId } = job.data;

    logger.info(`Processing custom code exuecution, runId: ${runId}`);

    await RedisClient.getInstance().setForRun(runId, JSON.stringify({ status: "Running" }));

    const results: CodeRunnerResult['results'] = [];
    let passedCount = 0;

    // Update progress
    await job.updateProgress(0);
    let n = testCases.length;
    for (let i = 0; i < n; i++) {
      const stdin = testCases[i].input;
      const stdout = testCases[i].output;

      try {
        const result = await executeCodeWithJudge0({
          code,
          languageId: languageCode,
          input: stdin,
          expectedOutput: stdout,
        });


        const passed = result.status === 'Accepted' && result.output.trim() === stdout.trim();

        if (passed) passedCount++;

        results.push({
          status: result.status,
          output: result.output,
          runtimeError: result.error,
          compilerError: result?.compileError,
          executionTime: result.time,
          memory: result.memory,
          passed,
        });
        await RedisClient.getInstance().setForRun(runId, JSON.stringify({ 
          status: "Running", 
          result: {
            runId,
            totalTestCases: n, 
            passedTestCases: passed,
            results
          }
        }));

        // Update progress
        const progress = Math.round(((i + 1) / n) * 100);
        await job.updateProgress(progress);

      } catch (error: any) {
        logger.error(`Error executing test case ${"testCase.id"}:`, error);
        console.log(error);

        results.push({
          status: 'Runtime Error',
          output: '',
          runtimeError: error.message,
          passed: false,
        });
      }
    }


    const finalResult: CodeRunnerResult = {
      runId,
      totalTestCases: n,
      passedTestCases: passedCount,
      results,
    };

    logger.info(`Run with id ${runId} completed: ${passedCount}/${n} passed`);

    return finalResult;
  },
  {
    connection: redisConfig,
    concurrency: 5,
  }
);