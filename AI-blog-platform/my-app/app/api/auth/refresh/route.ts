import { NextResponse, type NextRequest } from "next/server"
import { verifyRefreshJWT, signJWT } from "@/lib/jwt"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value
    if (!refreshToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyRefreshJWT(refreshToken)
    if (!payload?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Optionally verify user still exists / token not revoked
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accessToken = await signJWT({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { type: 'access' })

    const res = NextResponse.json({ success: true })
    res.cookies.set("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    })
    return res
  } catch (err) {
    logger.error("Refresh error", { error: err })
    return NextResponse.json({ error: "Failed to refresh" }, { status: 401 })
  }
}













