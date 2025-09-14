import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyJWT, extractTokenFromHeader } from "@/lib/jwt"
import { logger } from "@/lib/logger"
import { z } from "zod"

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    logger.error("Error fetching post:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const updates = updatePostSchema.parse(body)

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (existingPost.authorId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...updates }

    // Update slug if title changed
    if (updates.title) {
      updateData.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    }

    // Update read time if content changed
    if (updates.content) {
      const wordsPerMinute = 200
      const words = updates.content.trim().split(/\s+/).length
      updateData.readTime = Math.ceil(words / wordsPerMinute)
    }

    // Set publishedAt if status changed to published
    if (updates.status === "PUBLISHED" && existingPost.status !== "PUBLISHED") {
      updateData.publishedAt = new Date()
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    logger.info("Post updated successfully", { postId: post.id, authorId: payload.sub })
    return NextResponse.json({ success: true, post })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(issue => issue.message).join(", ") }, { status: 400 })
    }
    logger.error("Error updating post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (existingPost.authorId !== payload.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.post.delete({
      where: { id },
    })

    logger.info("Post deleted successfully", { postId: id, authorId: payload.sub })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error deleting post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}




