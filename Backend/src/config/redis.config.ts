import { createClient } from "redis";

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || "redis",
        port: Number(process.env.REDIS_PORT) || 6379
    }
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("ready", () => console.log("Connected to Redis successfully!"));

await redisClient.connect();

export default redisClient;