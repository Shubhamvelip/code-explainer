import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseAiResponse } from "@/lib/parseAiResponse";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_CANDIDATES = ["gemini-2.5-flash-lite", "gemini-flash-latest"];
const MAX_CODE_CHARS = 1800;
const MAX_LINE_BY_LINE = 3;
const MAX_ISSUES = 2;
const MAX_EXPLANATION_SENTENCES = 3;
const GENERATION_CONFIG = {
  temperature: 0.4,
  maxOutputTokens: 600,
};

function getModel() {
  if (!API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  return { genAI };
}

function truncateText(value, maxChars) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxChars)}...`;
}

function limitSentences(text, maxSentences) {
  if (typeof text !== "string" || !text.trim()) {
    return "";
  }

  const sentences = text
    .trim()
    .match(/[^.!?]+[.!?]?/g)
    ?.map((item) => item.trim())
    .filter(Boolean) ?? [];

  if (sentences.length === 0) {
    return truncateText(text, 220);
  }

  return sentences
    .slice(0, maxSentences)
    .join(" ")
    .trim();
}

function compactResponse(data) {
  const lineByLine = Array.isArray(data?.line_by_line) ? data.line_by_line : [];
  const issues = Array.isArray(data?.issues) ? data.issues : [];
  const errorLines = Array.isArray(data?.error_lines) ? data.error_lines : [];

  return {
    explanation: limitSentences(data?.explanation, MAX_EXPLANATION_SENTENCES),
    line_by_line: lineByLine.slice(0, MAX_LINE_BY_LINE).map((item) => ({
      line: truncateText(item?.line, 80),
      explanation: limitSentences(item?.explanation, 1),
    })),
    issues: issues.slice(0, MAX_ISSUES).map((item) => ({
      issue: limitSentences(item?.issue, 1),
      fix: limitSentences(item?.fix, 1),
    })),
    error_lines: errorLines,
    optimized_code: truncateText(data?.optimized_code, 700),
    time_complexity: truncateText(data?.time_complexity, 60),
  };
}

function isEmptyResponse(data) {
  return (
    !data?.explanation &&
    (!Array.isArray(data?.line_by_line) || data.line_by_line.length === 0) &&
    (!Array.isArray(data?.issues) || data.issues.length === 0) &&
    (!Array.isArray(data?.error_lines) || data.error_lines.length === 0) &&
    !data?.optimized_code &&
    !data?.time_complexity
  );
}

async function generateText(prompt) {
  const { genAI } = getModel();
  let lastError = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: GENERATION_CONFIG,
      });

      const result = await model.generateContent(prompt);
      const response = result?.response;
      const rawText = response?.text?.() ?? "";
      const finishReason = response?.candidates?.[0]?.finishReason ?? "unknown";

      console.log("[ai] model result", {
        model: modelName,
        finishReason,
        textLength: rawText.length,
      });

      if (!rawText.trim()) {
        lastError = new Error(`Empty model output from ${modelName}`);
        continue;
      }

      return rawText;
    } catch (error) {
      lastError = error;
      console.warn("[ai] model failed", { model: modelName, error });
    }
  }

  throw lastError || new Error("All model attempts failed.");
}

function createPrompt(code, language, mode) {
  const modeInstruction =
    mode === "beginner"
      ? "Use beginner-friendly wording."
      : "Use concise technical wording.";

  return `
Analyze this ${language} code and return strict JSON only.
${modeInstruction}
Keep output minimal and concise. Do not over-explain.

Return exactly this shape:
{
  "explanation": "",
  "line_by_line": [
    { "line": "", "explanation": "" }
  ],
  "issues": [
    { "issue": "", "fix": "" }
  ],
  "error_lines": [],
  "optimized_code": "",
  "time_complexity": ""
}

Rules:
- Do not include markdown, backticks, or extra text.
- explanation: max 2-3 short sentences.
- line_by_line: max 3 most important lines only.
- issues: max 2 issues only (syntax issues + bad practices).
- optimized_code: concise improved version.
- time_complexity: short format, e.g. "O(n) - linear time".
- error_lines: 1-based integer line numbers related to syntax issues or bad practices.
- If no syntax issues/bad practices, return "error_lines": [].

Code:
${code}
`.trim();
}

function createRecoveryPrompt(code, language, mode) {
  const modeInstruction =
    mode === "beginner"
      ? "Use beginner-friendly wording."
      : "Use concise technical wording.";

  return `
Re-analyze this ${language} code and return strict JSON only.
${modeInstruction}
Keep output minimal and concise. Do not over-explain.

Return exactly:
{
  "explanation": "",
  "line_by_line": [
    { "line": "", "explanation": "" }
  ],
  "issues": [
    { "issue": "", "fix": "" }
  ],
  "error_lines": [],
  "optimized_code": "",
  "time_complexity": ""
}

Limits:
- explanation: max 2-3 short sentences
- line_by_line: max 3 items
- issues: max 2 items
- time_complexity: short format like "O(n) - linear time"

Code:
${code}
`.trim();
}

export async function explainCode(code, language, mode) {
  const safeCode =
    typeof code === "string" ? code.slice(0, MAX_CODE_CHARS) : "";
  const safeLanguage = typeof language === "string" ? language : "unknown";
  const safeMode = mode === "beginner" ? "beginner" : "detailed";

  const prompt = createPrompt(safeCode, safeLanguage, safeMode);
  const rawText = await generateText(prompt);
  let compacted = compactResponse(parseAiResponse(rawText));

  if (isEmptyResponse(compacted)) {
    console.warn("[ai] empty parsed response, retrying once");
    const recoveryPrompt = createRecoveryPrompt(safeCode, safeLanguage, safeMode);
    const retryRawText = await generateText(recoveryPrompt);
    compacted = compactResponse(parseAiResponse(retryRawText));
  }

  if (isEmptyResponse(compacted)) {
    throw new Error("AI returned an empty structured response.");
  }

  return compacted;
}
