import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { passwordResetRequestSchema } from '@/lib/schemas/user'
import { generateOTP, generateOTPExpiration } from '@/lib/auth/otp'
import { sendOTPEmail } from '@/lib/email/mailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = passwordResetRequestSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    // Don't reveal if email exists (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          message:
            'If an account with that email exists, a password reset code has been sent.',
        },
        { status: 200 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = generateOTPExpiration(10) // 10 minutes

    // Store OTP in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOTP: otp,
        passwordResetExpires: otpExpires,
        passwordResetAttempts: 0,
      },
    })

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, 'password-reset')

    if (!emailResult.success) {
      console.error('[FORGOT PASSWORD] Failed to send OTP email:', emailResult.error)
      // Still return success message for security (don't reveal if email exists)
    }

    return NextResponse.json(
      {
        message:
          'If an account with that email exists, a password reset code has been sent.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid email format', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
