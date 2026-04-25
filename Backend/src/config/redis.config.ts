import { createClient } from "redis";

const redisClient  = createClient();

redisClient.on("error", (err) => console.error("Redis Client Error:", err));
redisClient.on("ready", () => console.log("Connected to Redis successfully!"));

await redisClient.connect();

export default redisClient;