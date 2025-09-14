import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    // Get all posts from database
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })
    
    return NextResponse.json({ success: true, posts })
  } catch (error) {
    logger.error("Error fetching posts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}
