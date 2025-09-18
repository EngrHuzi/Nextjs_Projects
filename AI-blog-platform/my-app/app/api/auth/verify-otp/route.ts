import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"
import { signJWT } from "@/lib/jwt"

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = verifySchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true })
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: "No code found. Please resend." }, { status: 400 })
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Code expired. Please resend." }, { status: 400 })
    }
    if (user.otpCode !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
    })

    // Issue tokens now that user is verified
    const accessToken = await signJWT({
      sub: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    }, { type: 'access' })
    const refreshToken = await signJWT({
      sub: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    }, { type: 'refresh' })

    const safeUser = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      createdAt: updated.createdAt.toISOString(),
    }

    const res = NextResponse.json({ success: true, user: safeUser })
    res.cookies.set("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    })
    res.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(", ") }, { status: 400 })
    }
    logger.error("Verify OTP error", { error: err })
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 })
  }
}






