import { NextResponse, type NextRequest } from "next/server"
import { verifyJWT, extractTokenFromHeader } from "@/lib/jwt"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(request.headers.get("authorization"))
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify JWT token
    const payload = await verifyJWT(token)
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user) {
      logger.warn("User not found with valid token", { userId: payload.sub })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return safe user object (without password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }

    return NextResponse.json({ user: safeUser })
  } catch (err) {
    logger.error("Error getting current user", { error: err })
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}