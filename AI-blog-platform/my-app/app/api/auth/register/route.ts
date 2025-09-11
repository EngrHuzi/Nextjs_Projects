import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signJWT } from "@/lib/jwt"
import { logger } from "@/lib/logger"
import { withDatabaseConnection } from "@/lib/middleware"

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

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
        updatedAt: new Date(),
      },
    })

    // Generate JWT token
    const token = await signJWT({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    // Create safe user object (without password)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    }

    logger.info("User registered successfully", { userId: user.id, role })
    return NextResponse.json({ success: true, user: safeUser, token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((issue) => issue.message).join(", ") }, { status: 400 })
    }
    logger.error("Register error", { error: err })
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
  })
}


