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
    res: Response
): void {
    const { command, args } = config.getCompiledCommand!(filePath, outPath);

    const compiler = spawn(command, args);

    compiler.stderr.on("data", (data) => {
        res.write(`\x1b[31m${data.toString()}\x1b[0m`);
    });

    compiler.on("close", (compilationResult) => {
        if (compilationResult !== 0) {
            cleanUp([filePath,outPath]);
            res.end();
            return ;
        }

        executeCode(config, filePath, outPath, input, res);
    });
}