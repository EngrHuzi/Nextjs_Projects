import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Get total published posts
    const totalPosts = await prisma.post.count({
      where: { status: "PUBLISHED" }
    })

    // Get unique authors count
    const totalAuthors = await prisma.user.count({
      where: {
        posts: {
          some: {
            status: "PUBLISHED"
          }
        }
      }
    })

    // Get recent posts (last 10)
    const recentPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
    })

    // Get top authors by post count
    const topAuthors = await prisma.user.findMany({
      where: {
        posts: {
          some: {
            status: "PUBLISHED"
          }
        }
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED"
              }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: "desc"
        }
      },
      take: 10,
    })

    const topAuthorsFormatted = topAuthors.map(author => ({
      id: author.id,
      name: author.name,
      postCount: author._count.posts
    }))

    return NextResponse.json({
      success: true,
      totalPosts,
      totalAuthors,
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        author: post.author,
        createdAt: post.publishedAt || post.createdAt,
        category: post.category,
      })),
      topAuthors: topAuthorsFormatted,
    })
  } catch (error) {
    logger.error("Error fetching community stats:", error)
    return NextResponse.json({ error: "Failed to fetch community stats" }, { status: 500 })
  }
}
