import { spawn } from "child_process";
import { type Response } from "express";
import type { LanguageConfig } from "../config/languages.config.js";
import cleanUp from "../utils/deletefiles.utils.js";
import executeCode from "./executer.service.js";

export default function compileCode(
    config: LanguageConfig,
    filePath: string,
    outPath: string,
    input: string,
): Promise<string> {
    return new Promise((resolve) => {
        const { command, args } = config.getCompiledCommand!(filePath, outPath);

        const compiler = spawn(command, args);

        let finalOutput = "";

        compiler.stderr.on("data", (data) => {
            finalOutput += `\x1b[31m${data.toString()}\x1b[0m`;
        });

        compiler.on("close", async (compilationResult) => {
            if (compilationResult !== 0) {
                cleanUp([filePath, outPath]);
                resolve(finalOutput);
                return;
            }

            const executionOutput = await executeCode(config, filePath, outPath, input);
            resolve(executionOutput);
        });
    })
}