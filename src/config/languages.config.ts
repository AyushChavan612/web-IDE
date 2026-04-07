import { dirname } from "path";

export interface ExecuteCommand {
    command: string;
    args: string[];
}

export interface LanguageConfig {
    extension: string;
    getCompiledCommand?: (filePath: string, outPath: string) => ExecuteCommand;
    getExecutionCommand: (outPath: string) => ExecuteCommand;
    isCompiled: boolean;
}

const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
    "cpp": {
        extension: "cpp",
        getCompiledCommand(filePath: string, outPath: string): ExecuteCommand {
            return { command: "g++", args: [filePath, "-o", outPath] };
        },
        getExecutionCommand(outPath: string): ExecuteCommand {
            return { command: outPath, args: [] };
        },
        isCompiled: true
    },
    "c": {
        extension: "c",
        getCompiledCommand(filePath: string, outPath: string): ExecuteCommand {
            return {command: "gcc", args: [filePath, "-o", outPath]};
        },
        getExecutionCommand(outPath: string): ExecuteCommand {
            return { command: outPath, args: [] };
        },
        isCompiled: true
    },
   "java": {
        extension: "java",
        getCompiledCommand(filepath: string, outpath: string): ExecuteCommand {
            return { 
                command: "javac", 
                args: [filepath] 
            };
        },
        getExecutionCommand(outPath: string): ExecuteCommand {
            const dirPath = dirname(outPath);
            return { 
                command: "java", 
                args: ["-cp", dirPath, "Main"] 
            };
        },
        isCompiled: true
    },
    "javascript": {
        extension: "js",
        getExecutionCommand(outPath: string): ExecuteCommand {
            return { command: "node", args: [outPath] };
        },
        isCompiled: false
    },
    "python3": {
        extension: "py",
        getExecutionCommand(outPath: string): ExecuteCommand {
            return { command: "python3", args: [outPath] };
        },
        isCompiled: false
    }
};

export default LANGUAGE_CONFIG;