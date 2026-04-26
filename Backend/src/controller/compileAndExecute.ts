import { type Request, type Response } from 'express';
import queueService from '../services/QueueFactory.service.js';
import { QueueEvents } from 'bullmq';

const queueEvents = new QueueEvents("compile_queue", { 
    connection: { host: "127.0.0.1", port: 6379 } 
});

export default async function compileAndExecute(req: Request, res: Response): Promise<void> {

    const { code, language , input } = req.body;

    if (!code) {
        res.status(400).json({ error: "No code provided" });
        return;
    }

    try {
        const job = await queueService.addJob("compile_queue", { code, language, input });
        const finalOutput = await job.waitUntilFinished(queueEvents);
        res.status(200).json({ output: finalOutput });
    } 
    catch (error) {
        console.error("Queue Error:", error);
        res.status(500).json({ error: "Server error during execution" });
    }
}


