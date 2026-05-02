import { spawn } from "child_process";
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
        console.log(`[Compiler] Spawning: ${command} ${args.join(' ')}`);
        const compiler = spawn(command, args, {
            timeout: 10000 
        });

        let finalOutput = "";

        compiler.stderr.on("data", (data) => {
            finalOutput += `\x1b[31m${data.toString()}\x1b[0m`;
        });

        compiler.on("close", async (compilationResult, signal) => {
            if (signal === "SIGTERM") {
                cleanUp([filePath, outPath]);
                resolve(`\x1b[31mCompilation Time Limit Exceeded (10s). Your code took too long to build.\x1b[0m`);
                return;
            }

            if (compilationResult !== 0) {
                cleanUp([filePath, outPath]);
                resolve(finalOutput);
                return;
            }

            const executionOutput = await executeCode(config, filePath, outPath, input);
            resolve(executionOutput);
        });
    });
}