import { Redis } from "ioredis";
import { redisConfig } from "../config/queue.config";

export class RedisClient {
    private static instance: RedisClient;
    private redis: Redis;
    private constructor() {
        this.redis = new Redis();
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

    public async getResult(runId: string) {
        return await this.redis.get(runId);
    }
}