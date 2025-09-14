import { type NextRequest, NextResponse } from "next/server"
import { generateTitleSuggestions } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { content, category } = await request.json()

    if (!content || content.trim().length < 50) {
      return NextResponse.json({ error: "Content must be at least 50 characters long" }, { status: 400 })
    }

    const suggestions = await generateTitleSuggestions(content, category)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Title suggestion API error:", error)
    return NextResponse.json({ error: "Failed to generate title suggestions" }, { status: 500 })
  }
}