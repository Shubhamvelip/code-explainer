"use client"

import { useState } from "react"
import { ExplainResponse } from "@/types/explain"
import { mockResponse } from "@/lib/mockData"

export function useExplain() {
  const [result, setResult] = useState<ExplainResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const explainCode = async (code: string, language: string) => {
    setLoading(true)

    // 🔹 MOCK MODE (replace later with API call)
    await new Promise((res) => setTimeout(res, 1500))
    setResult(mockResponse)

    // 🔹 FUTURE REAL API CALL
    /*
    const res = await fetch("/api/explain", {
      method: "POST",
      body: JSON.stringify({ code, language }),
      headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()
    setResult(data)
    */

    setLoading(false)
  }

  return { result, loading, explainCode }
}