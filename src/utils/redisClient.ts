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