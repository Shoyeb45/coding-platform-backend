import { Queue, Worker, Job } from 'bullmq';
import { redisConfig, queueConfig } from '../config/queue.config';
import { executeCodeWithJudge0 } from '../services/judge0.service';
import { logger } from '../utils/logger';
import { TCustomRun } from '../v1/types/run.type';

export interface CodeExecutionJobData {
    submissionId: string;
    userId: string;
    problemId: string;
    contestId?: string;
    code: string;
    language: string;
    testCases: Array<{
        id: string;
        input: string;
        expectedOutput: string;
        isHidden?: boolean;
    }>;
    sessionId: string;
}

export interface ExecutionResult {
    totalTestCases: number;
    passedTestCases: number;
    results: Array<{
        testCaseId: string;
        status: string;
        output: string;
        error?: string;
        executionTime?: number;
        memory?: number;
        passed: boolean;
    }>;
    overallStatus: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE';
    score: number;
}

// Create the queue
export const codeExecutionQueue = new Queue<TCustomRun>('code-execution', {
    connection: redisConfig,
    ...queueConfig,
});

// Worker to process jobs
export const codeExecutionWorker = new Worker<TCustomRun, ExecutionResult>(
    'code-execution',
    async (job: Job<TCustomRun>) => {
        const { code, languageId, input, output, problemId } = job.data;
        
        logger.info(`Processing submission: `);

        const results: ExecutionResult['results'] = [];
        let passedCount = 0;

        // Update progress
        await job.updateProgress(0);
        let n = input.length;
        for (let i = 0; i < n; i++) {
            const stdin = input[i];
            const stdout = output[i];
            
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
                    testCaseId: "testCase.id",
                    status: result.status,
                    output: result.output,
                    error: result.error,
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
                    testCaseId: "testCase.id",
                    status: 'Runtime Error',
                    output: '',
                    error: error.message,
                    passed: false,
                });
            }
        }

        // Determine overall status
        let overallStatus: ExecutionResult['overallStatus'] = 'WA';
        if (passedCount === n) {
            overallStatus = 'AC';
        } else if (results.some(r => r.status.includes('Time Limit'))) {
            overallStatus = 'TLE';
        } else if (results.some(r => r.status.includes('Memory Limit'))) {
            overallStatus = 'MLE';
        } else if (results.some(r => r.status.includes('Runtime Error'))) {
            overallStatus = 'RE';
        } else if (results.some(r => r.status.includes('Compilation Error'))) {
            overallStatus = 'CE';
        }

        const finalResult: ExecutionResult = {
            totalTestCases: n,
            passedTestCases: passedCount,
            results,
            overallStatus,
            score: Math.round((passedCount / n) * 100),
        };

        logger.info(`Submission ${"submissionId"} completed: ${passedCount}/${n} passed`);

        return finalResult;
    },
    {
        connection: redisConfig,
        concurrency: 5,
    }
);

// Worker event listeners
// codeExecutionWorker.on('completed', (job) => {
//     logger.info(`Job ${job.id} completed successfully`);
// });

// codeExecutionWorker.on('failed', (job, err) => {

//     logger.error(`Job ${job?.id} failed:`);
// });
