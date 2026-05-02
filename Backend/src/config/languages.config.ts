import { dirname, basename } from "path";
import { TEMP_PATH, HOST_TEMP_PATH } from "./path.config.js";

export interface ExecuteCommand {
    command: string;
    args: string[];
}

export interface LanguageConfig {
    extension: string;
    getCompiledCommand?: (filePath: string, outPath: string) => ExecuteCommand;
    getExecutionCommand: (outPath: string) => ExecuteCommand;
    isCompiled: boolean;
    timeoutMs: number;
}

/**
 * Converts a container-internal path to the corresponding host path
 * for Docker volume mounts in DooD (Docker-outside-of-Docker) setups.
 * e.g. /app/temp/123.cpp → /home/user/project/Backend/temp/123.cpp
 */
function toHostPath(containerPath: string): string {
    if (TEMP_PATH === HOST_TEMP_PATH) return containerPath; // local dev, no conversion needed
    return containerPath.replace(TEMP_PATH, HOST_TEMP_PATH);
}

const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
    "cpp": {
        extension: "cpp",
        getCompiledCommand(filePath: string, outPath: string): ExecuteCommand {
            const hostDir = dirname(toHostPath(filePath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "--memory=512m", "--memory-swap=512m", "-v", `${hostDir}:/code`, "gcc", "g++", `/code/${basename(filePath)}`, "-o", `/code/${basename(outPath)}`] 
            };
        },
        getExecutionCommand(outPath: string): ExecuteCommand {
            const hostDir = dirname(toHostPath(outPath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "-i", "--memory=256m", "--memory-swap=256m", "-v", `${hostDir}:/code`, "gcc", `/code/${basename(outPath)}`] 
            };
        },
        isCompiled: true,
        timeoutMs: 2000
    },
    "c": {
        extension: "c",
        getCompiledCommand(filePath: string, outPath: string): ExecuteCommand {
            const hostDir = dirname(toHostPath(filePath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "--memory=512m", "--memory-swap=512m", "-v", `${hostDir}:/code`, "gcc", "gcc", `/code/${basename(filePath)}`, "-o", `/code/${basename(outPath)}`] 
            };
        },
        getExecutionCommand(outPath: string): ExecuteCommand {
            const hostDir = dirname(toHostPath(outPath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "-i", "--memory=256m", "--memory-swap=256m", "-v", `${hostDir}:/code`, "gcc", `/code/${basename(outPath)}`] 
            };
        },
        isCompiled: true,
        timeoutMs: 2000
    },
  "java": {
        extension: "java",
        getCompiledCommand(filePath, outPath) {
            const hostDir = dirname(toHostPath(filePath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "--memory=512m", "-v", `${hostDir}:/code`, "eclipse-temurin:17", "javac", `/code/${basename(filePath)}`] 
            };
        },
        getExecutionCommand(outPath) {
            const hostDir = dirname(toHostPath(outPath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "-i", "--memory=256m", "-v", `${hostDir}:/code`, "eclipse-temurin:17", "java", "-cp", "/code", "Main"] 
            };
        },
        isCompiled: true,
        timeoutMs: 4000
    },
    "javascript": {
        extension: "js",
        getExecutionCommand(outPath: string): ExecuteCommand {
            const hostDir = dirname(toHostPath(outPath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "-i", "--memory=256m", "--memory-swap=256m", "-v", `${hostDir}:/code`, "node", "node", `/code/${basename(outPath)}`] 
            };
        },
        isCompiled: false,
        timeoutMs: 5000
    },
    "python3": {
        extension: "py",
        getExecutionCommand(outPath: string): ExecuteCommand {
            const hostDir = dirname(toHostPath(outPath));
            return { 
                command: "docker", 
                args: ["run", "--rm", "-i", "--memory=256m", "--memory-swap=256m", "-v", `${hostDir}:/code`, "python", "python3", `/code/${basename(outPath)}`] 
            };
        },
        isCompiled: false,
        timeoutMs: 5000,
    }
};

export default LANGUAGE_CONFIG;