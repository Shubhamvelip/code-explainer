import "./globals.css"
import Navbar from "@/components/ui/Navbar"

export const metadata = {
  title: "Code Explainer",
  description: "AI-powered code explanation tool",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}