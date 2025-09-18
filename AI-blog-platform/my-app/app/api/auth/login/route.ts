import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signJWT } from "@/lib/jwt"
import { logger } from "@/lib/logger"
import { withDatabaseConnection } from "@/lib/middleware"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  return withDatabaseConnection(request, async () => {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      logger.warn("Login attempt with non-existent email", { email })
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      logger.warn("Login attempt with invalid password", { email })
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({ requiresVerification: true, error: "Email not verified. Please check your inbox for the code." }, { status: 403 })
    }

    // Generate access and refresh tokens
    const accessToken = await signJWT({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { type: 'access' })
    const refreshToken = await signJWT({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, { type: 'refresh' })

    // Create safe user object (without password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }

    logger.info("User logged in successfully", { userId: user.id })
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
    logger.error("Login error", { error: err })
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
  })
}


