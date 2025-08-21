import { Queue, } from 'bullmq';
import { redisConfig, queueConfig } from '../config/queue.config';
import { QueueDataType } from '../v1/types/queue.type';
import { SubmissionQueueType } from '../v1/types/submission.type';




// Create the queue
export const codeRunnerQueue = new Queue<QueueDataType>('code-execution', {
    connection: redisConfig,
    ...queueConfig,
});


export const dbQueue = new Queue('database-operations', { 
    connection: redisConfig, 
    ...queueConfig 
});

export const submissionQueue = new Queue<SubmissionQueueType>('submission-execution', {
    connection: redisConfig,
    ...queueConfig
});