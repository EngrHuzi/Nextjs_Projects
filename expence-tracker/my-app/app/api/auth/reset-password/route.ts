import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { z } from 'zod'
import { verifyOTP } from '@/lib/auth/otp'

const passwordResetWithOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = passwordResetWithOTPSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        passwordResetOTP: true,
        passwordResetExpires: true,
        passwordResetAttempts: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify OTP
    const verification = verifyOTP(
      user.passwordResetOTP,
      validatedData.otp,
      user.passwordResetExpires,
      5,
      user.passwordResetAttempts
    )

    if (!verification.valid) {
      // Increment attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetAttempts: { increment: 1 },
        },
      })

      return NextResponse.json(
        { error: verification.error },
        { status: 400 }
      )
    }

    // Hash new password
    const passwordHash = await hashPassword(validatedData.password)

    // Update password and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetOTP: null,
        passwordResetExpires: null,
        passwordResetAttempts: 0,
      },
    })

    // TODO: Terminate all existing sessions (would require session storage)
    console.log(`[MVP] Password reset successful for user: ${user.email}`)

    return NextResponse.json(
      {
        message: 'Password has been reset successfully. You can now log in with your new password.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    )
  }
}
