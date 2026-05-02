// src/services/RedisQueueAdapter.ts
import { Queue } from "bullmq";
import type { IQueueServices } from "../interfaces/IQueueServices.js";
import dotenv from "dotenv";

dotenv.config();

export class RedisQueueAdapter implements IQueueServices {
    private queues: Map<string, Queue> = new Map();

    async addJob(queueName: string, payload: any): Promise<any> {
        if (!this.queues.has(queueName)) {
            const newQueue = new Queue(queueName, {
                connection: {
                    host: process.env.REDIS_HOST || "redis",
                    port: parseInt(process.env.REDIS_PORT || "6379")
                }
            });
            this.queues.set(queueName, newQueue);
        }

        const queue = this.queues.get(queueName)!;
        const job = await queue.add("execute_code", payload);
        console.log(`Job successfully added to ${queueName}`);
        return job;
    }
}