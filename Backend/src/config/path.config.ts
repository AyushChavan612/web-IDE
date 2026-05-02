import { join } from 'path';
import { execSync } from 'child_process';

// Path inside this container — used for file I/O (writeFile, readFile, etc.)
export const TEMP_PATH = join(process.cwd(), 'temp');

/**
 * Auto-detect the host-side path for /app/temp by inspecting
 * this container's own mounts via the Docker socket.
 * This is needed for DooD (Docker-outside-of-Docker) volume mounts.
 */
function detectHostTempPath(): string {
    // 1. Auto-detect via Docker inspect (most reliable in DooD)
    try {
        const containerId = execSync('hostname', { encoding: 'utf-8' }).trim();
        const mountSource = execSync(
            `docker inspect ${containerId} --format '{{range .Mounts}}{{if eq .Destination "/app/temp"}}{{.Source}}{{end}}{{end}}'`,
            { encoding: 'utf-8' }
        ).trim();

        if (mountSource) {
            console.log(`[PathConfig] Auto-detected host temp path: ${mountSource}`);
            return mountSource;
        }
    } catch (err) {
        console.warn('[PathConfig] Could not auto-detect host temp path via Docker inspect');
    }

    // 2. Fallback to environment variable
    if (process.env.HOST_TEMP_PATH) {
        console.log(`[PathConfig] Using HOST_TEMP_PATH from env: ${process.env.HOST_TEMP_PATH}`);
        return process.env.HOST_TEMP_PATH;
    }

    // 3. Fallback to container path (works for local dev without Docker)
    console.log(`[PathConfig] Falling back to container TEMP_PATH: ${TEMP_PATH}`);
    return TEMP_PATH;
}

// Path on the HOST machine — used for Docker volume mounts in DooD
export const HOST_TEMP_PATH = detectHostTempPath();

console.log(`[PathConfig] TEMP_PATH=${TEMP_PATH}`);
console.log(`[PathConfig] HOST_TEMP_PATH=${HOST_TEMP_PATH}`);


