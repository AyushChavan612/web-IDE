import { type Request, type Response } from 'express';
import { join } from 'path';
import { promises as fileManager } from 'fs';
import { TEMP_PATH } from '../config/path.config.js';
import LANGUAGE_CONFIG from '../config/languages.config.js';
import  compileCode  from '../services/compiler.service.js';
import  executeCode  from '../services/executer.service.js';

export default async function compileAndExecute(req: Request, res: Response): Promise<void> {
    const { code, language } = req.body;

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
    let filePath = "";
    let outPath = "";

    if (config.extension !== "java") {
        filePath = join(TEMP_PATH, `${fileId}.${config.extension}`);
    } else {
        filePath = join(TEMP_PATH, "Main.java");
    }

    if (config.isCompiled) {
        if (config.extension !== "java") {
            outPath = join(TEMP_PATH, `${fileId}.out`);
        } else {
            outPath = join(TEMP_PATH, "Main.class");
        }
    } else {
        outPath = filePath;
    }
    
    try {
        await fileManager.mkdir(TEMP_PATH, { recursive: true });
        await fileManager.writeFile(filePath, code);
    } catch (error) {
         console.log(`Error during file setup at path ${filePath}`);
         res.status(500).json({ error: "Server error during file setup" });
         return;
    }
    
    if (config.isCompiled) {
         compileCode(config, filePath, outPath, res);
    } else {
         executeCode(config, filePath, outPath, res);
    }
}