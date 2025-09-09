import { Job, Worker } from "bullmq";
import { SubmissionQueueType } from "../v1/types/submission.type";
import { redisConfig } from "../config/queue.config";
import { batchSubmissionWithJudge0 } from "../services/judge0.service";
import { logger } from "../utils/logger";
import { RedisClient } from "../utils/redisClient";
import { CodeRunnerResult, SubmissionRunnerResult } from "../v1/types/worker.type";
import { dbQueue } from "../queues/codeExecution.queue";



const BATCH_SIZE = 5;
const MAX_CONCURRENT_BATCHES = 3;

export const submissionRunnerWorker = new Worker<SubmissionQueueType, SubmissionRunnerResult>(
    'submission-execution',
    async (job: Job<SubmissionQueueType>) => {
        try {

            await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({ status: "Running" }));
            const preparedCode = `${job.data.prelude}\n\n${job.data.userCode}\n\n${job.data.driverCode}`; 

            // Split inputs into batches
            const inputs = job.data.testcases.map((testcase) => { return { input: testcase.input, output: testcase.output}; });
            const totalTestCases = job.data.testcases.length;
            let passedCount = 0;

            const batches = chunkArray(inputs, BATCH_SIZE);
            const allResults: CodeRunnerResult["results"] = [];

            // Process batches with concurrency limit
            for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
                const currentBatches = batches.slice(i, i + MAX_CONCURRENT_BATCHES);

                // Process current set of batches concurrently
                const batchPromises = currentBatches.map(batch =>
                    batchSubmissionWithJudge0(job.data.languageCode, preparedCode, batch)
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

                        if (passed) {
                            passedCount++;
                        }
                      
                        allResults.push({
                            status: result.status,
                            weight: job.data.testcases[testCaseIndex].weight ?? 1,
                            output: result.output,
                            runtimeError: result.error,
                            compilerError: result?.compileError,
                            executionTime: result.time,
                            memory: result.memory,
                            id: job.data.testcases[testCaseIndex].id,
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
                problemPoint: job.data.problemPoint,
                runnerResult,
                metadata: {
                    problemId: job.data.problemId,
                    languageId: job.data.languageId,
                    code: job.data.userCode,
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

        } catch (error: unknown) {
            if (error instanceof Error) {
                logger.error(`Batch processing failed: ${error.message}`);
                await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
                    status: "Failed",
                    error: error.message
                }));
            } else {
                logger.error("Batch processing failed with non-Error value");

                await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
                    status: "Failed",
                    error: String(error)
                }));
            }
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




// submission worker event handlers
submissionRunnerWorker.on('completed', async (job, result) => {
    // update the redis with status completed
    logger.info(`Submission with id: ${job.data.submissionId} successfully executed and evaluted.`);

    logger.info(`Adding the result to the database queue, for processing in database`);

    await dbQueue.add("save-submission-result", result, {
        attempts: 5, backoff: {
            type: "exponential",
            delay: 2000
        },
        removeOnComplete: 10,
        removeOnFail: 50
    });

    // update in redis
    await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
        status: "Done",
        result: result.runnerResult
    }));
    logger.info(`Redis client updated successfully for submission id : ${job.data.submissionId}`)
});

submissionRunnerWorker.on('failed', async (job, err) => {
    logger.error(`Submission execution failed for ${job?.data?.submissionId}: ${err}`);
    if (job?.data?.submissionId) {
        try {
            await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({
                status: "Failed",
                error: err.message,
                failedAt: new Date()
            }));
        } catch (redisError) {
            logger.error(`Failed to update Redis with failure status: ${redisError}`);
        }
    }
});
