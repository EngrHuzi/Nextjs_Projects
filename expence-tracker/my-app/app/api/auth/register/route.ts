import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { userRegistrationSchema } from '@/lib/schemas/user'
import { sendOTPEmail } from '@/lib/email/mailer'
import { generateOTP, generateOTPExpiration } from '@/lib/auth/otp'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = userRegistrationSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password)

    // Generate OTP
    const otp = generateOTP()
    const otpExpires = generateOTPExpiration(10) // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        emailVerified: false,
        emailVerificationOTP: otp,
        emailVerificationExpires: otpExpires,
        emailVerificationAttempts: 0,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, 'verification')

    if (!emailResult.success) {
      console.error('[REGISTRATION] Failed to send OTP email:', emailResult.error)
      // Don't fail registration if email fails - user can request new OTP
    }

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email for the verification code.',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid registration data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
