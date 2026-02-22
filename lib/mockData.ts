import { ExplainResponse } from "@/types/explain"

export const mockResponse: ExplainResponse = {
  explanation:
    "This program prints 'Hello World' to the console. It uses a print statement.",
  issues: ["No input handling", "Not reusable"],
  improvedCode: "print('Hello World')"
}