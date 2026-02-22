const DEFAULT_AI_RESPONSE = {
  explanation: "",
  line_by_line: [],
  issues: [],
  error_lines: [],
  optimized_code: "",
  time_complexity: "",
};

function isEmptyResponse(value) {
  return (
    !value?.explanation &&
    (!Array.isArray(value?.line_by_line) || value.line_by_line.length === 0) &&
    (!Array.isArray(value?.issues) || value.issues.length === 0) &&
    (!Array.isArray(value?.error_lines) || value.error_lines.length === 0) &&
    !value?.optimized_code &&
    !value?.time_complexity
  );
}

function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeLineByLine(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    line: typeof item?.line === "string" ? item.line : "",
    explanation: typeof item?.explanation === "string" ? item.explanation : "",
  }));
}

function normalizeIssues(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => ({
    issue: typeof item?.issue === "string" ? item.issue : "",
    fix: typeof item?.fix === "string" ? item.fix : "",
  }));
}

function normalizeErrorLines(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const lines = value
    .map((line) => {
      if (typeof line === "number") {
        return Number.isFinite(line) ? Math.trunc(line) : null;
      }

      if (typeof line === "string" && line.trim()) {
        const parsed = Number(line.trim());
        return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
      }

      return null;
    })
    .filter((line) => typeof line === "number" && line > 0);

  return Array.from(new Set(lines));
}

function normalizeResponse(value) {
  return {
    explanation:
      typeof value?.explanation === "string" ? value.explanation : "",
    line_by_line: normalizeLineByLine(value?.line_by_line),
    issues: normalizeIssues(value?.issues),
    error_lines: normalizeErrorLines(value?.error_lines),
    optimized_code:
      typeof value?.optimized_code === "string" ? value.optimized_code : "",
    time_complexity:
      typeof value?.time_complexity === "string" ? value.time_complexity : "",
  };
}

function tryParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractLineByLineFromText(text) {
  const results = [];
  const regex =
    /"line"\s*:\s*"([^"]*)"\s*,\s*"explanation"\s*:\s*"([^"]*)"/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push({
      line: match[1] || "",
      explanation: match[2] || "",
    });
  }

  return results;
}

function extractIssuesFromText(text) {
  const results = [];
  const regex =
    /"issue"\s*:\s*"([^"]*)"\s*,\s*"fix"\s*:\s*"([^"]*)"/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push({
      issue: match[1] || "",
      fix: match[2] || "",
    });
  }

  return results;
}

function extractErrorLinesFromText(text) {
  const blockMatch = text.match(/"error_lines"\s*:\s*\[([^\]]*)/i);
  if (!blockMatch?.[1]) {
    return [];
  }

  return blockMatch[1]
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((num) => Number.isFinite(num) && num > 0)
    .map((num) => Math.trunc(num));
}

function extractTextField(text, key) {
  const match = text.match(new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"`));
  return match?.[1]?.trim() || "";
}

function extractComplexityFromText(text) {
  const fromKey = extractTextField(text, "time_complexity");
  if (fromKey) {
    return fromKey;
  }

  const bigOMatch = text.match(/O\([^)]+\)[^,\n}]*/i);
  return bigOMatch?.[0]?.trim() || "";
}

function buildFallbackFromText(rawText) {
  const cleaned = cleanText(rawText);
  if (!cleaned) {
    return { ...DEFAULT_AI_RESPONSE };
  }

  const explanation = extractTextField(cleaned, "explanation");
  const partialExplanation =
    cleaned.match(/"explanation"\s*:\s*"([^"]*)/i)?.[1]?.trim() || "";
  const optimizedCode = extractTextField(cleaned, "optimized_code");
  const lineByLine = extractLineByLineFromText(cleaned);
  const issues = extractIssuesFromText(cleaned);
  const errorLines = extractErrorLinesFromText(cleaned);
  const timeComplexity = extractComplexityFromText(cleaned);

  const plainLine =
    cleaned
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(
        (line) =>
          line.length > 0 &&
          !line.startsWith("{") &&
          !line.startsWith("}") &&
          !line.startsWith("\"")
      ) || "";

  const fallbackExplanation =
    explanation || partialExplanation || plainLine || "Could not parse full AI response.";

  return {
    explanation: fallbackExplanation.slice(0, 240),
    line_by_line: lineByLine,
    issues,
    error_lines: errorLines,
    optimized_code: optimizedCode,
    time_complexity: timeComplexity,
  };
}

export function parseAiResponse(rawText) {
  if (typeof rawText !== "string" || !rawText.trim()) {
    return { ...DEFAULT_AI_RESPONSE };
  }

  const cleaned = cleanText(rawText);
  const directParsed = tryParse(cleaned);
  if (directParsed) {
    const normalized = normalizeResponse(directParsed);
    if (!isEmptyResponse(normalized)) {
      return normalized;
    }
  }

  const regexMatches = [
    cleaned.match(/```json\s*([\s\S]*?)\s*```/i),
    cleaned.match(/({[\s\S]*})/),
  ];

  for (const match of regexMatches) {
    const candidate = match?.[1] ?? match?.[0];
    if (!candidate) {
      continue;
    }

    const parsed = tryParse(candidate.trim());
    if (parsed) {
      const normalized = normalizeResponse(parsed);
      if (!isEmptyResponse(normalized)) {
        return normalized;
      }
    }
  }

  const fallback = normalizeResponse(buildFallbackFromText(cleaned));
  if (!isEmptyResponse(fallback)) {
    return fallback;
  }

  return { ...DEFAULT_AI_RESPONSE };
}
