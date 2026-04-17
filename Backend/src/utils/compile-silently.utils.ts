import dotenv from "dotenv";
dotenv.config();

export default async function compileSilently(
    code: string, 
    language: string, 
    input: string
): Promise<boolean> {
    try {
        const compiler = process.env.COMPILER_API_URL as string;
        const response = await fetch(compiler, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: language,
                code: code,
                input: input
            })
        });

        const outputText = await response.text();

        if (outputText.includes('\x1b[31m')) {
            return false;
        }
        
        return true;
    } catch (error) {
        console.error("Error communicating with backend:", error);
        return false;
    }
}