import { promises as fileManager } from 'fs';

export default async function cleanUp(paths: string[]): Promise<void> {
    for (const targetPath of paths) {
        try {
            await fileManager.rm(targetPath, { recursive: true, force: true });
        } catch (error) {
            console.log(`cleanup skipped for path : ${targetPath}`);
        }
    }
}