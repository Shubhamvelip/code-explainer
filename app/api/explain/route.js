import { NextResponse } from "next/server";
import { explainCode } from "@/lib/ai";

export async function POST(request) {
  console.log("[/api/explain] POST request received");

  try {
    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code : "";
    const language = typeof body?.language === "string" ? body.language : "unknown";
    const mode = body?.mode === "beginner" ? "beginner" : "detailed";

    if (!code.trim()) {
      console.log("[/api/explain] Missing code");
      return NextResponse.json(
        { success: false, error: "Code is required." },
        { status: 400 }
      );
    }

    console.log("[/api/explain] Running explainCode", {
      language,
      mode,
      codeLength: code.length,
    });

    const data = await explainCode(code, language, mode);

    console.log("[/api/explain] Success");
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[/api/explain] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
