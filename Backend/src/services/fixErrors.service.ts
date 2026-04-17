import type { Request, Response } from "express";
import compileSilently from "../utils/compile-silently.utils.js";
import dotenv from "dotenv";

dotenv.config();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AIResponse {
    explaination: string;
    fixedCode: string; 
}

const MAX_ATTEMPTS = 3; 

export default async function fixErrors(req: Request, res: Response): Promise<void> {
    const { code, error, language, input } = req.body;
    
    // Trim error trace to prevent massive payloads
    const trimmedError = error ? String(error).substring(0, 1500) : "No error trace provided";
    
    const prompt = `
        You are an expert ${language} debugging assistant. 
        The user's code encountered an error. It either failed to compile or crashed during execution (runtime error).
        Analyze the error trace, identify the bug, and provide the complete, corrected code.

        Standard Input (User's Test Case):
        ${input || "None provided"}

        Error Trace / Execution Output:
        ${trimmedError}

        Original Code:
        ${code}

      STRICT FORMATING RULES:
        - Do NOT use backticks (\`) or markdown inside the JSON values.
        - Use only plain text for complexity (e.g., O(N log N)).
        - The "optimizedCode" field must contain the raw source code. You MUST preserve all code formatting, indentation, and use explicit newline characters (\n) for every line break. Do not squash the code into a single line.

        You must output strictly matching this exact JSON structure:
        {
            "explaination": "A concise, 1-sentence explanation of what caused the compilation or runtime error.",
            "fixedCode": "The complete source code with the error fixed."
        }`;

    const API_KEY = process.env.GROQ_API_KEY as string;
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; ++attempt) {
        try {
            console.log(`[FixErrors] Attempt ${attempt} reaching Groq...`);
            const response = await fetch(GROQ_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile", 
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                })
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(`Groq API error: ${errData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            const jsonString = data.choices[0].message.content;
            const result: AIResponse = JSON.parse(jsonString);

            try {
                const isCompilable = await compileSilently(result.fixedCode, language, input);
                if (isCompilable) {
                    res.status(200).json(result);
                    return; 
                }
                console.log(`[FixErrors] Code failed silent compilation on attempt ${attempt}. Retrying...`);
            } catch (compilerErr) {
                console.error("[FixErrors] Local Compiler is down or timed out. Skipping verification.");
                res.status(200).json(result);
                return;
            }

        }
        catch (err) {
            console.error(`[FixErrors] AI Service Error on attempt ${attempt}:`, err);
            
            if (attempt === MAX_ATTEMPTS) {
                res.status(500).json({ error: "AI Engine is offline or failed to generate a valid response." });
                return; 
            }
            
            await delay(2000);
        }
    }

    res.status(400).json({ error: "The AI failed to fix the code after maximum attempts. The logic might be too broken." });
}