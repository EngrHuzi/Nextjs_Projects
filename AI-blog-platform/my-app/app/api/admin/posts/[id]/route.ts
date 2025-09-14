import { NextRequest, NextResponse } from "next/server"
import { verifyAdminAuth } from "@/lib/admin-auth"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    if (updates.status && !["DRAFT", "PUBLISHED"].includes(updates.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...updates }

    // Set publishedAt if status changed to published
    if (updates.status === "PUBLISHED") {
      const existingPost = await prisma.post.findUnique({ where: { id } })
      if (existingPost && existingPost.status !== "PUBLISHED") {
        updateData.publishedAt = new Date()
      }
    }

    const updatedPost = await prisma.post.update({
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

    return NextResponse.json({ success: true, post: updatedPost })
  } catch (error) {
    logger.error("Error updating post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update post" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 })
    }

    const { id } = await params

    // Check if post exists
    const existingPost = await prisma.post.findUnique({ where: { id } })
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      )
    }

    await prisma.post.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error deleting post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
