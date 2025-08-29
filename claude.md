I am encountering following error while running submission worker:

```
Error: connect ECONNREFUSED 127.0.0.1:6379
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1634:16) {
  errno: -4078,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 6379
}
```

Here's my submission worker:
```ts
import { Job, Worker } from "bullmq";
import { SubmissionQueueType } from "../v1/types/submission.type";
import { redisConfig } from "../config/queue.config";
import { batchSubmissionWithJudge0 } from "../services/judge0.service";
import { logger } from "../utils/logger";
import { RedisClient } from "../utils/redisClient";
import { CodeRunnerResult, SubmissionRunnerResult } from "../v1/types/worker.type";
import { dbQueue } from "../queues/codeExecution.queue";
import { config } from "../config";

const BATCH_SIZE = 5;
const MAX_CONCURRENT_BATCHES = 3;

export const submissionRunnerWorker = new Worker<SubmissionQueueType, SubmissionRunnerResult>(
    'submission-execution',
    async (job: Job<SubmissionQueueType>) => {
        try {

            await RedisClient.getInstance().setForRun(job.data.submissionId, JSON.stringify({ status: "Running" }));
            //// code .... /////
              // Split inputs into batches
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




// submission worker event handlers
submissionRunnerWorker.on('completed', async (job, result) => {
    // update the redis with status completed
    logger.info(`Submission with id: ${job.data.submissionId} successfully executed and evaluted.`);

    logger.info(`Adding the result to the database queue, for processing in database`);

    await dbQueue.add("save-submission-result", {
        type: "save-submission-result", data: result
    }, {
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

```


And I am running other workers such as codeRunnerWorker and dbOperationWorker, they are connecting fine.

and also redist client, it's also connecting

```
import { Redis } from "ioredis";
import { config } from "./../config/index";
import { logger } from "./logger";

export class RedisClient {
    private static instance: RedisClient;
    private redis: Redis | undefined;
    private constructor() {
        try {
            this.redis = new Redis({
                host: config.redisHost,
                port: config.redisPort,
                password: config.redisPassword
            });
        } catch (error) {
            this.redis = undefined;
            console.error(error)
        }

    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RedisClient();
        }
        return this.instance;
    }

    public async setForRun(runId: string, value: string) {
        if (!this.redis) {
            logger.error("No redis client is present");
            return;
        }
        await this.redis.set(runId, value, "EX", 300);
    }
    
    public async getResult(key: string) {
        if (!this.redis) {
            logger.error("No redis client is present");
            return;
        }
        return await this.redis.get(key);
    }
    
    public async setTestcase(problemId: string, value: string) {
        if (!this.redis) {
            logger.error("No redis client is present");
            return;
        }
        await this.redis.set(problemId, value, "EX", 4 * 60 * 60); // 4 hours
    }
}
```