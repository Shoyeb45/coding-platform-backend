import { Job, Worker } from "bullmq";
import { SubmissionQueueType } from "../v1/types/submission.type";
import { redisConfig } from "../config/queue.config";
import { Judge0ExecutionResult } from "../v1/types/judge0.type";
import { batchSubmissionWithJudge0 } from "../services/judge0.service";
import { logger } from "../utils/logger";
import { RedisClient } from "../utils/redisClient";


const BATCH_SIZE = 5;
const MAX_CONCURRENT_BATCHES = 3;

export const submissionRunnerWorker = new Worker<SubmissionQueueType, Judge0ExecutionResult[]>(
    'submission-execution',
    async (job: Job<SubmissionQueueType>) => {
        // Split inputs into batches
        try {
            await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({ status: "Running" }));

            // Split inputs into batches
            const inputs = job.data.testcases.map((testcase) => { return testcase.input; });
            
            const batches = chunkArray(inputs, BATCH_SIZE);
            console.log(batches);
            const allResults: Judge0ExecutionResult[] = [];

            // Process batches with concurrency limit
            for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
                const currentBatches = batches.slice(i, i + MAX_CONCURRENT_BATCHES);

                // Process current set of batches concurrently
                const batchPromises = currentBatches.map(batch =>
                    batchSubmissionWithJudge0(job.data.languageCode, job.data.code, batch)
                );

                const batchResults = await Promise.all(batchPromises);

                // Flatten and add to results
                batchResults.forEach(results => allResults.push(...results));

                // update in redis
                await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({ status: "Running", results: allResults }));
                logger.info(`Processed ${allResults.length}/${inputs.length} test cases`);
            }

            return allResults;

        } catch (error: any) {
            logger.error(`Batch processing failed: ${error.message}`);
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