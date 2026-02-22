type Props = {
  code: string
  setCode: (value: string) => void
}

export default function CodeInput({ code, setCode }: Props) {
  return (
   <textarea
  value={code}
  onChange={(e) => setCode(e.target.value)}
  placeholder="// Paste your code here..."
  className="
    w-full h-64 p-4
    border rounded-lg
    font-mono text-sm
    bg-gray-900 text-green-300
    focus:outline-none focus:ring-2 focus:ring-blue-500
  "
/>
  )
}