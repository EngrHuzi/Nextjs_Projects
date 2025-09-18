import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"
import { sendOtpEmail } from "@/lib/mailer"

const resendSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true })
    }

    // Simple resend rate limit: only allow new code if previous is expired or at least 60s passed
    const now = Date.now()
    if (user.otpExpiresAt && user.otpCode) {
      const issuedAt = user.otpExpiresAt.getTime() - 10 * 60 * 1000
      if (now - issuedAt < 60 * 1000) {
        const waitMs = 60 * 1000 - (now - issuedAt)
        return NextResponse.json({ error: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting a new code` }, { status: 429 })
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(now + 10 * 60 * 1000)
    await prisma.user.update({ where: { id: user.id }, data: { otpCode: code, otpExpiresAt: expires } })

    try {
      await sendOtpEmail(user.email, code)
    } catch (e) {
      logger.error("Failed to resend OTP email", { error: e })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues.map((e) => e.message).join(", ") }, { status: 400 })
    }
    logger.error("Resend OTP error", { error: err })
    return NextResponse.json({ error: "Failed to resend code" }, { status: 500 })
  }
}






