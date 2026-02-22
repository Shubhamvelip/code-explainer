"use client"

import { useState } from "react"
import CodeInput from "@/components/ui/CodeInput"
import LanguageSelector from "@/components/ui/LanguageSelector"
import ExplainButton from "@/components/ui/ExplainButton"
import ResultPanel from "@/components/ui/ResultPanel"
import { useExplain } from "@/hooks/useExplain"
import type { ExplainMode } from "@/types/explain"

export default function ExplainForm() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("python")
  const [mode, setMode] = useState<ExplainMode>("beginner")

  const { explain, loading, error, runExplain } = useExplain()

  return (
    <div className="space-y-8">
      <LanguageSelector
        language={language}
        setLanguage={setLanguage}
      />

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as ExplainMode)}
        className="border p-2 rounded"
      >
        <option value="beginner">Beginner</option>
        <option value="detailed">Detailed</option>
      </select>

      <CodeInput code={code} setCode={setCode} />

      <ExplainButton
        loading={loading}
        onClick={() => runExplain(code, language, mode)}
      />

      {loading && (
        <p className="text-center text-gray-500">
          Analyzing your code...
        </p>
      )}

      {error && (
        <p className="text-center text-red-600">
          Something went wrong. Please try again.
        </p>
      )}

      <ResultPanel result={explain} />
    </div>
  )
}
