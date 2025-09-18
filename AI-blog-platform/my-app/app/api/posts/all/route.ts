import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyJWT, extractTokenFromHeader } from "@/lib/jwt"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Extract token from cookie or header
    const cookieToken = request.cookies.get("auth_token")?.value || null
    const headerToken = extractTokenFromHeader(request.headers.get("authorization"))
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // "all", "published", "draft"
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // Build where clause
    const where: Record<string, unknown> = { authorId: payload.sub }

    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get user's posts
    const posts = await prisma.post.findMany({
      where,
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

    // Get counts for different statuses
    const [publishedCount, draftCount] = await Promise.all([
      prisma.post.count({ where: { authorId: payload.sub, status: "PUBLISHED" } }),
      prisma.post.count({ where: { authorId: payload.sub, status: "DRAFT" } }),
    ])

    return NextResponse.json({
      success: true,
      posts,
      counts: {
        published: publishedCount,
        draft: draftCount,
        total: publishedCount + draftCount,
      },
    })
  } catch (error) {
    logger.error("Error fetching all posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}




