const DEFAULT_AI_RESPONSE = {
  explanation: "",
  line_by_line: [],
  issues: [],
  optimized_code: "",
  time_complexity: "",
};

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

function normalizeResponse(value) {
  return {
    explanation:
      typeof value?.explanation === "string" ? value.explanation : "",
    line_by_line: normalizeLineByLine(value?.line_by_line),
    issues: normalizeIssues(value?.issues),
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

export function parseAiResponse(rawText) {
  if (typeof rawText !== "string" || !rawText.trim()) {
    return { ...DEFAULT_AI_RESPONSE };
  }

  const directParsed = tryParse(rawText.trim());
  if (directParsed) {
    return normalizeResponse(directParsed);
  }

  const regexMatches = [
    rawText.match(/```json\s*([\s\S]*?)\s*```/i),
    rawText.match(/({[\s\S]*})/),
  ];

  for (const match of regexMatches) {
    const candidate = match?.[1] ?? match?.[0];
    if (!candidate) {
      continue;
    }

    const parsed = tryParse(candidate.trim());
    if (parsed) {
      return normalizeResponse(parsed);
    }
  }

  return { ...DEFAULT_AI_RESPONSE };
}

