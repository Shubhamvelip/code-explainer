import ExplainForm from "@/features/explain/ExplainForm"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">
          AI Code Explainer
        </h1>

        <ExplainForm />
      </div>
    </div>
  )
}