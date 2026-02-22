"use client"

import { useState } from "react"
import type {
  ExplainApiResponse,
  ExplainMode,
  ExplainResponse,
} from "@/types/explain"

export function useExplain() {
  const [explain, setExplain] = useState<ExplainResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runExplain = async (
    code: string,
    language: string,
    mode: ExplainMode = "beginner"
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          mode,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to explain code.")
      }

      const responseData = (await response.json()) as ExplainApiResponse
      console.log("[useExplain] API response:", responseData)

      if (!responseData?.data) {
        throw new Error("Invalid response from server.")
      }

      setExplain(responseData.data)
    } catch (err) {
      console.error("[useExplain] API error:", err)
      const message =
        err instanceof Error ? err.message : "Something went wrong."
      setError(message)
      setExplain(null)
    } finally {
      setLoading(false)
    }
  }

  return { explain, loading, error, runExplain }
}
