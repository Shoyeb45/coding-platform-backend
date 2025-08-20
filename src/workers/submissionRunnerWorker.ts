import { Job, Worker } from "bullmq";
import { SubmissionQueueType } from "../v1/types/submission.type";
import { redisConfig } from "../config/queue.config";
import { Judge0ExecutionResult } from "../v1/types/judge0.type";
import { batchSubmissionWithJudge0 } from "../services/judge0.service";
import { logger } from "../utils/logger";
import { RedisClient } from "../utils/redisClient";
import { CodeRunnerResult, SubmissionRunnerResult } from "../v1/types/worker.type";

const BATCH_SIZE = 5;
const MAX_CONCURRENT_BATCHES = 3;

export const submissionRunnerWorker = new Worker<SubmissionQueueType, SubmissionRunnerResult>(
    'submission-execution',
    async (job: Job<SubmissionQueueType>) => {
        try {
            await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({ status: "Running" }));

            // Split inputs into batches
            const inputs = job.data.testcases.map((testcase) => { return testcase.input; });
            const totalTestCases = job.data.testcases.length;
            let passedCount = 0;
            
            const batches = chunkArray(inputs, BATCH_SIZE);
            const allResults: CodeRunnerResult["results"] = [];

            // Process batches with concurrency limit
            for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
                const currentBatches = batches.slice(i, i + MAX_CONCURRENT_BATCHES);

                // Process current set of batches concurrently
                const batchPromises = currentBatches.map(batch =>
                    batchSubmissionWithJudge0(job.data.languageCode, job.data.code, batch)
                );

                const batchResults = await Promise.all(batchPromises);

                // Flatten and add to results
                let batchIndex = 0;
                batchResults.forEach(results => {
                    results.forEach((result, resultIndex) => {
                        // Calculate the overall test case index
                        const testCaseIndex = (i + batchIndex) * BATCH_SIZE + resultIndex;
                        
                        // Get expected output from the corresponding test case
                        const expectedOutput = job.data.testcases[testCaseIndex]?.output || '';
                        
                        const passed = result.status === 'Accepted' && result.output.trim() === expectedOutput.trim();
                        
                        if (passed) passedCount++;

                        allResults.push({
                            status: result.status,
                            weight: job.data.testcases[testCaseIndex].weight ?? 1,
                            output: result.output,
                            runtimeError: result.error,
                            compilerError: result?.compileError,
                            executionTime: result.time,
                            memory: result.memory,
                            passed,
                        });
                    });
                    batchIndex++;
                });

                // Update in redis with current progress
                await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
                    status: "Running",
                    result: {
                        runId: job.data.submissionId,
                        totalTestCases: totalTestCases,
                        passedTestCases: passedCount,
                        results: allResults
                    }
                }));
                
                logger.info(`Processed ${allResults.length}/${totalTestCases} test cases`);
            }

            // Create final result matching custom runner structure
            const runnerResult: CodeRunnerResult = {
                runId: job.data.submissionId,
                totalTestCases: totalTestCases,
                passedTestCases: passedCount,
                results: allResults,
            };

            const finalResult: SubmissionRunnerResult = {
                runnerResult,
                metadata: {
                    problemId: job.data.problemId,
                    languageId: job.data.languageId,
                    code: job.data.code,
                    submittedAt: job.data.submittedAt,
                    studentId: job.data.studentId,
                    contestId: job.data.contestId
                }
            }
            // Update Redis with final successful result
            await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
                status: "Completed",
                result: runnerResult
            }));

            logger.info(`Submission with id ${job.data.submissionId} completed: ${passedCount}/${totalTestCases} passed`);

            return finalResult;

        } catch (error: any) {
            logger.error(`Batch processing failed: ${error.message}`);
            
            // Update Redis with error status
            await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
                status: "Failed",
                error: error.message
            }));
            
            throw error;
        }
    },
    {
        connection: redisConfig,
        concurrency: 5,
    }
);

// helper functions
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}