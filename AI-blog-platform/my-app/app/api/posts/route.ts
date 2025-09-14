import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyJWT, extractTokenFromHeader } from "@/lib/jwt"
import { logger } from "@/lib/logger"
import { z } from "zod"

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})

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

    // Get user's posts
    const posts = await prisma.post.findMany({
      where: { authorId: payload.sub },
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
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { title, content, excerpt, category, tags, status } = createPostSchema.parse(body)

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    // Calculate read time
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    const readTime = Math.ceil(words / wordsPerMinute)

    // Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + "...",
        category,
        tags,
        status,
        slug,
        readTime,
        authorId: payload.sub,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
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

    logger.info("Post created successfully", { postId: post.id, authorId: payload.sub })
    return NextResponse.json({ success: true, post })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(issue => issue.message).join(", ") }, { status: 400 })
    }
    logger.error("Error creating post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}


