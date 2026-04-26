import type { IQueueServices } from "../interfaces/IQueueServices.js";
import dotenv from "dotenv"
import { RedisQueueAdapter } from "./RedisQueueAdapter.service.js";

dotenv.config();

export class QueueFactory {
    static getQueueService(): IQueueServices {
        const provider = process.env.QUEUE_PROVIDER || "redis";

        if (provider === "kafka") {
            throw new Error("Kafka adapter is not built yet!");
        }

        return new RedisQueueAdapter();
    }
}

const queueService = QueueFactory.getQueueService();
export default queueService;