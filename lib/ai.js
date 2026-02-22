import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseAiResponse } from "@/lib/parseAiResponse";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-flash-latest";

function getModel() {
  if (!API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

function createPrompt(code, language, mode) {
  const learningMode = mode === "beginner" ? "beginner" : "detailed";

  return `
You are an expert software engineer and code teacher.
Analyze the ${language} code below and return ONLY valid JSON.

Mode: ${learningMode}
- If mode is "beginner", explain in very simple words.
- If mode is "detailed", explain with technical detail.
- Keep all explanations concise.
- Detect bugs and inefficiencies.
- Suggest improved code.

Output must match this exact JSON shape and keys:
{
  "explanation": "",
  "line_by_line": [
    { "line": "", "explanation": "" }
  ],
  "issues": [
    { "issue": "", "fix": "" }
  ],
  "optimized_code": "",
  "time_complexity": ""
}

Rules:
- Return strict JSON only.
- Do not include markdown, backticks, or extra text.
- "line_by_line" should focus on key lines (line number or short snippet in "line").
- "time_complexity" should be the main Big-O complexity.

Code:
${code}
`.trim();
}

export async function explainCode(code, language, mode) {
  const safeCode = typeof code === "string" ? code : "";
  const safeLanguage = typeof language === "string" ? language : "unknown";
  const safeMode = mode === "beginner" ? "beginner" : "detailed";

  const prompt = createPrompt(safeCode, safeLanguage, safeMode);
  const model = getModel();

  const result = await model.generateContent(prompt);
  const rawText = result?.response?.text?.() ?? "";
  return parseAiResponse(rawText);
}
