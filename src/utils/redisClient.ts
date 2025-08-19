import { Redis } from "ioredis";
import { config } from "./../config/index";

export class RedisClient {
    private static instance: RedisClient;
    private redis: Redis;
    private constructor() {
        this.redis = new Redis({
            host: config.redisHost,
            port: config.redisPort,
            password: config.redisPassword
        });
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RedisClient();
        }
        return this.instance;
    }

    public async setForRun(runId: string, value: string) {
        await this.redis.set(runId, value, "EX", 300);
    }

    public async getResult(key: string) {
        return await this.redis.get(key);
    }

    public async setTestcase(problemId: string, value: string) {
        await this.redis.set(problemId, value, "EX", 4 * 60 * 60); // 4 hours
    }
}