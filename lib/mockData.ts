import { ExplainResponse } from "@/types/explain"

export const mockResponse: ExplainResponse = {
  explanation:
    "This function takes two inputs and returns their sum.",
  line_by_line: [
    {
      line: "function add(a, b) {",
      explanation: "Defines a function named add with two parameters.",
    },
    {
      line: "return a + b",
      explanation: "Returns the addition of the two parameters.",
    },
    {
      line: "}",
      explanation: "Ends the function block.",
    },
  ],
  issues: [
    {
      issue: "No type checks",
      fix: "Validate inputs before adding to avoid unexpected results.",
    },
  ],
  error_lines: [1],
  optimized_code: "function add(a, b) { return Number(a) + Number(b); }",
  time_complexity: "O(1)",
}
