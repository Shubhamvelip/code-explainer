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
    const safeCode = typeof code === "string" ? code : ""
    const safeLanguage = typeof language === "string" ? language : "unknown"
    const safeMode: ExplainMode = mode === "detailed" ? "detailed" : "beginner"

    if (!safeCode.trim()) {
      setError("Code is required.")
      setExplain(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: safeCode,
          language: safeLanguage,
          mode: safeMode,
        }),
      })

      const data = (await res.json()) as ExplainApiResponse
      console.log("[useExplain] API response:", data)

      if (!res.ok || !data?.success || !data?.data) {
        const message = data?.error || "Failed to explain code."
        setError(message)
        setExplain(null)
        return
      }

      setExplain(data.data)
    } catch (err) {
      console.error("[useExplain] API error:", err)
      setError("Something went wrong while explaining code.")
      setExplain(null)
    } finally {
      setLoading(false)
    }
  }

  return { explain, loading, error, runExplain }
}
