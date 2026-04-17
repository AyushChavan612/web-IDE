import type { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MAX_ATTEMPTS = 3;

interface AIResponse {
    timeComplexity: string;
    spaceComplexity: string;
    explaination: string;
    optimizedCode: string;
}

export default async function optimizeCode(req: Request, res: Response): Promise<void> {
    const { code, language } = req.body;

    const prompt = `
        You are an expert ${language} competitive programming coach.
        
        CORE TASKS:
        1. VALIDATE: Check if the code is logically correct.
        2. CORRECT: If incorrect, fix logical bugs/syntax. Explain the fix in the "explaination" field.
        3. OPTIMIZE: Provide the most efficient version (Asymptotic or Constant-factor).

     STRICT FORMATING RULES:
        - Do NOT use backticks (\`) or markdown inside the JSON values.
        - Use only plain text for complexity (e.g., O(N log N)).
        - The "optimizedCode" field must contain the raw source code. You MUST preserve all code formatting, indentation, and use explicit newline characters (\n) for every line break. Do not squash the code into a single line.

        Original Code:
        ${code}

        You must output strictly matching this exact JSON format:
        {
            "explaination": "Plain text summary of corrections and optimizations.",
            "timeComplexity": "Plain text Big-O",
            "spaceComplexity": "Plain text Big-O",
            "optimizedCode": "Raw source code string"
        }`;

    const API_KEY = process.env.GROQ_API_KEY as string;
    const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; ++attempt) {
        try {
            console.log(`[Optimize] Attempt ${attempt} reaching Groq...`);
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

            res.status(200).json(result);
            return;

        } catch (error) {
            console.error(`[Optimize] AI Service Error on attempt ${attempt}:`, error);
            
            if (attempt === MAX_ATTEMPTS) {
                res.status(503).json({ error: "AI servers are currently overloaded. Please try again later." });
                return;
            }

            await delay(2000);
        }
    }
}