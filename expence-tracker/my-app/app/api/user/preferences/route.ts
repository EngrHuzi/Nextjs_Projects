// T196-T197: User preferences API for notification settings
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// T197: Preferences update schema
const preferencesSchema = z.object({
  budgetAlertsEnabled: z.boolean().optional(),
  dailyRemindersEnabled: z.boolean().optional(),
  reminderTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).nullable().optional(), // HH:MM format
  notificationMethod: z.enum(['IN_APP', 'EMAIL', 'BOTH']).optional()
})

// T196: GET /api/user/preferences - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        budgetAlertsEnabled: true,
        dailyRemindersEnabled: true,
        reminderTime: true,
        notificationMethod: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      preferences: user
    })
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// T197: PUT /api/user/preferences - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = preferencesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { budgetAlertsEnabled, dailyRemindersEnabled, reminderTime, notificationMethod } = validation.data

    // Build update object with only provided fields
    const updateData: any = {}
    if (budgetAlertsEnabled !== undefined) updateData.budgetAlertsEnabled = budgetAlertsEnabled
    if (dailyRemindersEnabled !== undefined) updateData.dailyRemindersEnabled = dailyRemindersEnabled
    if (reminderTime !== undefined) updateData.reminderTime = reminderTime
    if (notificationMethod !== undefined) updateData.notificationMethod = notificationMethod

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        budgetAlertsEnabled: true,
        dailyRemindersEnabled: true,
        reminderTime: true,
        notificationMethod: true
      }
    })

    return NextResponse.json({
      success: true,
      preferences: updatedUser
    })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
