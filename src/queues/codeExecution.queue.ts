import { Queue,  } from 'bullmq';
import { redisConfig, queueConfig } from '../config/queue.config';
import { QueueDataType } from '../v1/types/queue.type';




// Create the queue
export const codeRunnerQueue = new Queue<QueueDataType>('code-execution', {
    connection: redisConfig,
    ...queueConfig,
});


