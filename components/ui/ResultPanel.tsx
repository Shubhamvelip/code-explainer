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
        <h2 className="font-semibold">Line-by-line</h2>
        <ul className="list-disc pl-5">
          {result.line_by_line.map((item, i) => (
            <li key={`${item.line}-${i}`}>
              <span className="font-medium">{item.line}:</span> {item.explanation}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Issues</h2>
        <ul className="list-disc pl-5">
          {result.issues.map((item, i) => (
            <li key={`${item.issue}-${i}`}>
              <span className="font-medium">{item.issue}</span> - {item.fix}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-semibold">Optimized Code</h2>
        <pre className="bg-gray-100 p-3 rounded overflow-auto">
          {result.optimized_code}
        </pre>
      </div>

      <div>
        <h2 className="font-semibold">Time Complexity</h2>
        <p>{result.time_complexity}</p>
      </div>
    </div>
  )
}
