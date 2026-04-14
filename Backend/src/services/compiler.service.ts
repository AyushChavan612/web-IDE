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

    compiler.stderr.on("data", (data) => {
        res.write("[ERROR_CHUNK]" + data.toString());
    });

    compiler.on("close", (compilationResult) => {
        if (compilationResult !== 0) {
            cleanUp([filePath]);
            res.end();
            return;
        }

        executeCode(config, filePath , outPath, input , res);
    });
}