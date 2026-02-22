export type ExplainMode = "beginner" | "detailed"

export type ExplainRequest = {
  code: string
  language: string
  mode: ExplainMode
}

export type ExplainLine = {
  line: string
  explanation: string
}

export type ExplainIssue = {
  issue: string
  fix: string
}

export type ExplainResponse = {
  explanation: string
  line_by_line: ExplainLine[]
  issues: ExplainIssue[]
  optimized_code: string
  time_complexity: string
}

export type ExplainApiResponse = {
  success: boolean
  data?: ExplainResponse
  error?: string
}
