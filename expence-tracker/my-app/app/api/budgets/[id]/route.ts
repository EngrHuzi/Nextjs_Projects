import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Decimal } from 'decimal.js'

// Update budget schema (only amount can be updated)
const updateBudgetSchema = z.object({
  amount: z
    .number({
      message: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(1000000, 'Budget amount cannot exceed $1,000,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
})

// PUT /api/budgets/[id] - Update budget amount
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID
    const uuidSchema = z.string().uuid()
    const uuidValidation = uuidSchema.safeParse(id)
    if (!uuidValidation.success) {
      return NextResponse.json({ error: 'Invalid budget ID' }, { status: 400 })
    }

    const body = await request.json()

    // Validate request body
    const validation = updateBudgetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { amount } = validation.data

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Update budget
    const budget = await prisma.budget.update({
      where: {
        id,
      },
      data: {
        amount: new Decimal(amount),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    })

    // Calculate current spending for updated budget
    const monthStart = new Date(budget.month.getFullYear(), budget.month.getMonth(), 1)
    const monthEnd = new Date(budget.month.getFullYear(), budget.month.getMonth() + 1, 0, 23, 59, 59, 999)

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        categoryId: budget.categoryId,
        type: 'EXPENSE',
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        amount: true,
      },
    })

    const spending = transactions.reduce(
      (sum, tx) => sum.plus(new Decimal(tx.amount.toString())),
      new Decimal(0)
    )

    const budgetAmount = new Decimal(budget.amount.toString())
    const remaining = budgetAmount.minus(spending)
    const percentage = budgetAmount.isZero()
      ? 0
      : spending.dividedBy(budgetAmount).times(100).toNumber()

    let status: 'green' | 'yellow' | 'red'
    if (percentage < 70) {
      status = 'green'
    } else if (percentage < 90) {
      status = 'yellow'
    } else {
      status = 'red'
    }

    return NextResponse.json({
      budget: {
        id: budget.id,
        categoryId: budget.categoryId,
        category: budget.category,
        amount: budget.amount.toNumber(),
        month: budget.month.toISOString(),
        spending: spending.toNumber(),
        remaining: remaining.toNumber(),
        percentage: Math.round(percentage * 10) / 10,
        status,
        createdAt: budget.createdAt.toISOString(),
        updatedAt: budget.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}

// DELETE /api/budgets/[id] - Delete budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Validate UUID
    const uuidSchema = z.string().uuid()
    const uuidValidation = uuidSchema.safeParse(id)
    if (!uuidValidation.success) {
      return NextResponse.json({ error: 'Invalid budget ID' }, { status: 400 })
    }

    // Check if budget exists and belongs to user
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Delete budget
    await prisma.budget.delete({
      where: {
        id,
      },
    })

    return NextResponse.json(
      { message: 'Budget deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}
