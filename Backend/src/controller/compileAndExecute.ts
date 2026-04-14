import { type Request, type Response } from 'express';
import { join } from 'path';
import { promises as fileManager } from 'fs';
import { TEMP_PATH } from '../config/path.config.js';
import LANGUAGE_CONFIG from '../config/languages.config.js';
import  executeCode  from '../services/executer.service.js';
import  compileCode  from '../services/compiler.service.js';


export default async function compileAndExecute(req: Request, res: Response): Promise<void> {

    const { code, language , input } = req.body;

    if (!code) {
        res.status(400).json({ error: "No code provided" });
        return;
    }

    const config = LANGUAGE_CONFIG[language];

    if (!config) {
        res.status(400).json({ error: "Language not supported" });
        return;
    }
    
    const fileId = Date.now();
    const executionDir = join(TEMP_PATH , fileId.toString());
    let filePath = "";
    let outPath = "";

    try {
        await fileManager.mkdir(executionDir);
    } catch (error) {
        console.error("Failed to create execution directory:", error);
        res.status(500).json({ error: "Server error during file setup" });
        return;
    }

    if (config.extension !== "java") {
        filePath = join(TEMP_PATH, `${fileId}.${config.extension}`);
    } else {
        filePath = join(executionDir, "Main.java");
    }

    if (config.isCompiled) {
        if (config.extension !== "java") {
            outPath = join(TEMP_PATH, `${fileId}.out`);
        } else {
            outPath = join(executionDir, "Main.class");
        }
    } else {
        outPath = filePath;
    }
    
    try {
        await fileManager.writeFile(filePath, code);
    } catch (error) {
        console.log(`Error during file setup at path ${filePath}`);
        res.status(500).json({ error: "Server error during file setup" });
        return;
    }

    res.setHeader("Content-Type"  , 'text/plain');
    res.setHeader("Transfer-Encoding" , 'chunked');
    
    if (config.isCompiled) {
        compileCode(config, filePath, outPath, input, res);
    } else {
        executeCode(config, filePath, outPath, input, res);
    }
}


