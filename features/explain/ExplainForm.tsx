"use client"

import { useState } from "react"
import CodeInput from "@/components/ui/CodeInput"
import LanguageSelector from "@/components/ui/LanguageSelector"
import ExplainButton from "@/components/ui/ExplainButton"
import ResultPanel from "@/components/ui/ResultPanel"
import { useExplain } from "@/hooks/useExplain"

export default function ExplainForm() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("python")

  const { result, loading, explainCode } = useExplain()

  return (
    <div className="space-y-8">
      <LanguageSelector
        language={language}
        setLanguage={setLanguage}
      />

      <CodeInput code={code} setCode={setCode} />

      <ExplainButton
        loading={loading}
        onClick={() => explainCode(code, language)}
      />

      {loading && (
  <p className="text-center text-gray-500">
    Analyzing your code...
  </p>
)}

      <ResultPanel result={result} />
    </div>
  )
}