import { logger } from '../utils/logger';
import { executeCodeWithJudge0 } from '../services/judge0.service';
import { TCustomRun } from '../v1/types/run.type';
import { Worker, Job } from "bullmq";
import { redisConfig } from '../config/queue.config';
import { QueueDataType } from '../v1/types/queue.type';
import { CodeRunnerResult } from '../v1/types/worker.type';
import { RedisClient } from '../utils/redisClient';




export const codeRunnerWorker = new Worker<QueueDataType, CodeRunnerResult>(
  'code-execution',
  async (job: Job<QueueDataType>) => {
    const { code, languageId, testCases, problemId, runId } = job.data;
    
    logger.info(`Processing submission: `);

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
          languageId,
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

    logger.info(`Submission ${"submissionId"} completed: ${passedCount}/${n} passed`);

    return finalResult;
  },
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

// Worker event handlers
codeRunnerWorker.on('completed', async (job, result) => {
  logger.info(`Custom run with runId: ${result.runId}, processed successfully`);
  
  await RedisClient.getInstance().setForRun(result.runId, JSON.stringify({ status: "Done", result }))
  logger.info(`Redis client updated successfully for runId: ${result.runId}`)
});

codeRunnerWorker.on('failed', async (job, err) => {
  if (!job) {
    logger.error("Failed to execute the code");
    return;
  }

  logger.error(`Job ${job?.id} failed: ${err.message}`);
  await RedisClient.getInstance().setForRun(job.data.runId, JSON.stringify({ status: "Failed" } ));
});

// Start worker
logger.info('🔄 Code execution worker started');
