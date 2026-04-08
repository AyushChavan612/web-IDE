import { promises as fileManager } from 'fs';

export default async function cleanUp(files: string[]): Promise<void> {
    for (const filePath of files) {
        try {
            await fileManager.access(filePath); 
            await fileManager.unlink(filePath); 
        } catch (error) {
            console.log(`cleanup skipped for filepath : ${filePath}`);
        }
    }
}