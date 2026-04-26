import { Worker, Job } from "bullmq";
import { join } from 'path';
import { promises as fileManager } from 'fs';
import { TEMP_PATH } from '../config/path.config.js';
import LANGUAGE_CONFIG from '../config/languages.config.js';
import executeCode from '../services/executer.service.js';
import compileCode from '../services/compiler.service.js';

const compileWorker = new Worker(
    "compile_queue",
    async (job: Job) => {
        const { code, language, input} = job.data;
        const config = LANGUAGE_CONFIG[language];

        if (!config) throw new Error("Language not supported");

        const fileId = Date.now();
        const executionDir = join(TEMP_PATH, fileId.toString());
        let filePath = "";
        let outPath = "";

        await fileManager.mkdir(executionDir);

        if (config.extension !== "java") {
            filePath = join(TEMP_PATH, `${fileId}.${config.extension}`);
        } else {
            filePath = join(executionDir, "Main.java");
        }

        if (config.isCompiled) {
            outPath = config.extension !== "java" ? join(TEMP_PATH, `${fileId}.out`) : join(executionDir, "Main.class");
        } else {
            outPath = filePath;
        }
        
        await fileManager.writeFile(filePath, code);

        let finalResult = "";
        
        if (config.isCompiled) {
            finalResult = await compileCode(config, filePath, outPath, input);
        } else {
            finalResult = await executeCode(config, filePath, outPath, input);
        }

        return finalResult;
    },
    {
        connection: { host: "127.0.0.1", port: 6379 },
        concurrency: 5 
    }
);

compileWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});