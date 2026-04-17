import { spawn } from "child_process";
import { type Response } from "express";
import type { LanguageConfig } from "../config/languages.config.js";
import cleanUp from "../utils/deletefiles.utils.js";

export default function executeCode(
    config: LanguageConfig,
    filePath : string,
    outPath : string,
    input : string,
    res: Response
): void {
    const { command, args } = config.getExecutionCommand(outPath);

    const execution = spawn(command, args);

    if(input){
        execution.stdin.write(input);
        execution.stdin.end();
    }

    execution.stdout.on("data", (data) => {
        res.write(data.toString());
    });

    execution.stderr.on("data", (data) => {
        res.write(`\x1b[31m${data.toString()}\x1b[0m`);
    });

    execution.on("close", (executionResult) => {
        if (config.isCompiled) {
            cleanUp([filePath, outPath]);
        } else {
            cleanUp([outPath]);
        }
        res.end();
    });
}