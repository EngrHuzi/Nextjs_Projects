import { type NextRequest, NextResponse } from "next/server"
import { generateSEOKeywords } from "@/lib/ai"

export async function POST(request: NextRequest) {
  try {
    const { title, content, category } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const seoData = await generateSEOKeywords(title, content, category)

    return NextResponse.json(seoData)
  } catch (error) {
    console.error("SEO keywords API error:", error)
    return NextResponse.json({ error: "Failed to generate SEO keywords" }, { status: 500 })
  }
}