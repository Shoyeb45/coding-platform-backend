import { ConnectionOptions } from 'bullmq';
import dotenv from 'dotenv';
import { config } from './index';
dotenv.config();

export const redisConfig: ConnectionOptions = {
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

export const queueConfig = {
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
  },
};
