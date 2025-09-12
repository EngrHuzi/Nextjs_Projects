import { NextRequest, NextResponse } from "next/server"
import { getStoredPosts } from "@/lib/blog"
import { verifyAdminAuth } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    // Get all posts
    const posts = getStoredPosts()
    
    return NextResponse.json({ success: true, posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}
