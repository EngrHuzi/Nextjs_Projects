import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
//import { signJWT } from "@/lib/jwt"
import { sendOtpEmail } from "@/lib/mailer"
import { logger } from "@/lib/logger"
import { withDatabaseConnection } from "@/lib/middleware/db-connection"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: NextRequest) {
  return withDatabaseConnection(request, async () => {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      logger.warn("Registration attempt with existing email", { email })
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Determine role (first user is admin)
    const usersCount = await prisma.user.count()
    const role = usersCount === 0 ? "ADMIN" : "USER"


    // Create user in database as unverified
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
        emailVerified: false,
        updatedAt: new Date(),
      },
    })

    // Generate OTP and store with expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: code, otpExpiresAt: expires },
    })

    // Send OTP email (best-effort)
    try {
      await sendOtpEmail(user.email, code)
    } catch (e) {
      // If email fails, still return success to allow resend; log error
      logger.error("Failed to send OTP email", { error: e })
    }

    // Create safe user object (without password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }

    logger.info("User registered successfully; OTP sent", { userId: user.id, role })
    // Do not set auth cookies until email verified
    return NextResponse.json({
      success: true,
      requiresVerification: true,
      user: safeUser,
      message: role === "ADMIN" ? "You are the first user - you have been granted admin privileges!" : "Registration successful! Please verify your email."
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((issue) => issue.message).join(", ") }, { status: 400 })
    }
    logger.error("Register error", { error: err })
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
  })
}


