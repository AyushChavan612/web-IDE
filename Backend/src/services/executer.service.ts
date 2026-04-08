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

    let output = "";
    let runtimeError = "";

    const execution = spawn(command, args);

    if(input){
        execution.stdin.write(input);
        execution.stdin.end();
    }

    execution.stdout.on("data", (data) => {
        output += data.toString();
    });

    execution.stderr.on("data", (data) => {
        runtimeError += data.toString();
    });

    execution.on("close", (executionResult) => {
        if (config.isCompiled) {
            cleanUp([filePath, outPath]);
        } else {
            cleanUp([outPath]);
        }

        if (executionResult !== 0) {
            res.status(400).json({ error: runtimeError, status: "Runtime Error" });
        } else {
            res.status(200).json({ output: output, status: "success" });
        }
    });
}