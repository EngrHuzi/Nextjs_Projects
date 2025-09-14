import { type NextRequest, NextResponse } from "next/server"
import { generateContentSummary } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content || content.trim().length < 100) {
      return NextResponse.json({ error: "Content must be at least 100 characters long" }, { status: 400 })
    }

    const summary = await generateContentSummary(content)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Summarization API error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}