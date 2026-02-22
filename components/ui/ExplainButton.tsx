type Props = {
  onClick: () => void
  loading: boolean
}

export default function ExplainButton({ onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
        w-full py-3 rounded-lg
        bg-blue-600 text-white font-semibold
        hover:bg-blue-700
        transition
        disabled:opacity-50
      "
    >
      {loading ? "Analyzing code..." : "Explain Code"}
    </button>
  )
}
