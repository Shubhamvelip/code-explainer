type Props = {
  language: string
  setLanguage: (value: string) => void
}

export default function LanguageSelector({
  language,
  setLanguage,
}: Props) {
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="python">Python</option>
      <option value="javascript">JavaScript</option>
      <option value="cpp">C++</option>
      <option value="java">Java</option>
    </select>
  )
}