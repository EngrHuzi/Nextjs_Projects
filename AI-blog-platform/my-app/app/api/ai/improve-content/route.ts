import { type NextRequest, NextResponse } from "next/server"
import { improveContent } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { content, improvementType } = await request.json()

    if (!content || content.trim().length < 50) {
      return NextResponse.json({ error: "Content must be at least 50 characters long" }, { status: 400 })
    }

    if (!["grammar", "clarity", "engagement"].includes(improvementType)) {
      return NextResponse.json({ error: "Invalid improvement type" }, { status: 400 })
    }

    const improvedContent = await improveContent(content, improvementType)

    return NextResponse.json({ improvedContent })
  } catch (error) {
    console.error("Content improvement API error:", error)
    return NextResponse.json({ error: "Failed to improve content" }, { status: 500 })
  }
}