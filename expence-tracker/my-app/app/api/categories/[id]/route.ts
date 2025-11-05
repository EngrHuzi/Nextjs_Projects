import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/schemas/category'

// T098: PUT /api/categories/[id] (update category name)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // Check category exists and belongs to user
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // T102: Prevent editing predefined categories
    if (existingCategory.isPredefined) {
      return NextResponse.json(
        { error: 'Cannot edit predefined categories' },
        { status: 403 }
      )
    }

    // Ensure category belongs to user
    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // T100: Check for duplicate name (excluding current category)
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        id: { not: params.id },
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

    if (duplicateCategory) {
      return NextResponse.json(
        {
          error: `A ${validatedData.type.toLowerCase()} category named "${validatedData.name}" already exists`,
        },
        { status: 400 }
      )
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        type: validatedData.type,
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

    return NextResponse.json(category)
  } catch (error) {
    console.error('Update category error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid category data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// T099: DELETE /api/categories/[id] (delete if no transactions)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check category exists and belongs to user
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // T102: Prevent deleting predefined categories
    if (existingCategory.isPredefined) {
      return NextResponse.json(
        { error: 'Cannot delete predefined categories' },
        { status: 403 }
      )
    }

    // Ensure category belongs to user
    if (existingCategory.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // T101: Check if category is used in any transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        userId: session.user.id,
        category: existingCategory.name,
      },
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${existingCategory.name}" because it is used in ${transactionCount} transaction(s)`,
        },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
