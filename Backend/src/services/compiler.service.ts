import { spawn } from "child_process";
import { type Response } from "express";
import type { LanguageConfig } from "../config/languages.config.js";
import cleanUp from "../utils/deletefiles.utils.js";
import executeCode from "./executer.service.js";

export default function compileCode(
    config: LanguageConfig,
    filePath: string,
    outPath: string,
    input : string,
    res: Response
): void {
    const { command, args } = config.getCompiledCommand!(filePath, outPath);

    const compiler = spawn(command, args);
    let compilationError = "";

    compiler.stderr.on("data", (data) => {
        compilationError += data.toString();
    });

    compiler.on("close", (compilationResult) => {
        if (compilationResult !== 0) {
            cleanUp([filePath]);
            res.status(400).json({ error: compilationError, status: "Compilation error" });
            return;
        }

        executeCode(config, filePath , outPath, input , res);
    });
}