import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.config.js"; 

export const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    handler: (_req, res) => {
        res.status(429).json({ error: "Too many AI requests from this IP. Please try again in a minute." });
    }
});

export const compileRateLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 10, 
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    handler: (_req, res) => {
        res.status(429).json({ error: "Too many compilation requests. Please slow down." });
    }
});