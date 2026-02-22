import { ExplainResponse } from "@/types/explain"

type Props = {
  result: ExplainResponse | null
}

export default function ResultPanel({ result }: Props) {
  if (!result) return null

  return (
    <div className="space-y-4 border p-4 rounded">
      <div>
        <h2 className="font-semibold">Explanation</h2>
        <p>{result.explanation}</p>
      </div>

      <div>
        <h2 className="font-semibold">Issues</h2>
        <ul className="list-disc pl-5">
          {result.issues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Improved Code</h2>
        <pre className="bg-gray-100 p-3 rounded overflow-auto">
          {result.improvedCode}
        </pre>
      </div>
    </div>
  )
}