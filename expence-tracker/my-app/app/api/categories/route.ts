import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/schemas/category'

// T096: GET /api/categories (list categories for user + predefined)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'EXPENSE' | 'INCOME' | null

    // Build where clause
    const where: any = {
      OR: [
        { isPredefined: true }, // Predefined categories (userId is null)
        { userId: session.user.id }, // User's custom categories
      ],
    }

    if (type) {
      where.type = type
    }

    // Fetch categories
    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        name: 'asc', // Alphabetical order
      },
      select: {
        id: true,
        name: true,
        type: true,
        isPredefined: true,
        userId: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('List categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// T097: POST /api/categories (create custom category)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // T100: Check for duplicate category name (per user per type)
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          {
            userId: session.user.id,
            name: validatedData.name,
            type: validatedData.type,
          },
          {
            isPredefined: true,
            name: validatedData.name,
            type: validatedData.type,
          },
        ],
      },
    })

    if (existingCategory) {
      return NextResponse.json(
        {
          error: `A ${validatedData.type.toLowerCase()} category named "${validatedData.name}" already exists`,
        },
        { status: 400 }
      )
    }

    // Create custom category
    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        type: validatedData.type,
        isPredefined: false,
      },
      select: {
        id: true,
        name: true,
        type: true,
        isPredefined: true,
        userId: true,
        createdAt: true,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid category data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
