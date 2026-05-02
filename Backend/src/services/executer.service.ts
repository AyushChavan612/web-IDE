import { spawn } from "child_process";
import type { LanguageConfig } from "../config/languages.config.js";
import cleanUp from "../utils/deletefiles.utils.js";

export default function executeCode(
    config: LanguageConfig,
    filePath: string,
    outPath: string,
    input: string,
): Promise<string> {

    return new Promise((resolve) => {
        const { command, args } = config.getExecutionCommand(outPath);
        const timeoutMs = config?.timeoutMs;

        const execution = spawn(command, args , {
            timeout : timeoutMs
        });

        if (input) {
            execution.stdin.write(input);
            execution.stdin.end();
        }
        
        let finalOutput = "" ;
        execution.stdout.on("data", (data) => {
            finalOutput += data.toString();
        });

        execution.stderr.on("data", (data) => {
            finalOutput += `\x1b[31m${data.toString()}\x1b[0m`;
        });

        execution.on("close", (executionResult,signal) => {
            if (config.isCompiled) {
                cleanUp([filePath, outPath]);
            } else {
                cleanUp([outPath]);
            }
            if(signal === "SIGTERM"){
                finalOutput += "\nTime Limit Exceeded (TLE) considering platform limits"
            }
            else if(executionResult === 137){
                finalOutput += "\nMemory Limit Exceeded (MLE) considering platform limits"
            }
            resolve(finalOutput);
        });
    });
}