export type ExplainRequest = {
  code: string
  language: string
  level?: "beginner" | "intermediate" | "advanced"
}

export type ExplainResponse = {
  explanation: string
  issues: string[]
  improvedCode: string
}