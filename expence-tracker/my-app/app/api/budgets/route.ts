import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { budgetSchema } from '@/lib/schemas/budget'
import { Decimal } from 'decimal.js'
import { z } from 'zod'

// GET /api/budgets - List budgets with current month spending
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    // Parse month (default to current month)
    const targetDate = month ? new Date(month) : new Date()
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get all budgets for user
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        month: {
          gte: monthStart,
          lte: monthEnd,
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        // Sum all expense transactions for this category in the month
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

        // Calculate total spending using Decimal for precision
        const spending = transactions.reduce(
          (sum, tx) => sum.plus(new Decimal(tx.amount.toString())),
          new Decimal(0)
        )

        const budgetAmount = new Decimal(budget.amount.toString())
        const remaining = budgetAmount.minus(spending)
        const percentage = budgetAmount.isZero()
          ? 0
          : spending.dividedBy(budgetAmount).times(100).toNumber()

        // Determine status
        let status: 'green' | 'yellow' | 'red'
        if (percentage < 70) {
          status = 'green'
        } else if (percentage < 90) {
          status = 'yellow'
        } else {
          status = 'red'
        }

        return {
          id: budget.id,
          categoryId: budget.categoryId,
          category: budget.category,
          amount: budget.amount.toNumber(),
          month: budget.month.toISOString(),
          spending: spending.toNumber(),
          remaining: remaining.toNumber(),
          percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
          status,
          createdAt: budget.createdAt.toISOString(),
          updatedAt: budget.updatedAt.toISOString(),
        }
      })
    )

    return NextResponse.json({
      budgets: budgetsWithSpending,
      month: monthStart.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

// POST /api/budgets - Create budget
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body
    const validation = budgetSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { categoryId, amount, month } = validation.data

    // Normalize month to start of month
    const monthDate = new Date(month)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)

    // Check if category exists and belongs to user or is predefined
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [
          { userId: session.user.id },
          { isPredefined: true },
        ],
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category is an expense category (budgets only for expenses)
    if (category.type !== 'EXPENSE') {
      return NextResponse.json(
        { error: 'Budgets can only be created for expense categories' },
        { status: 400 }
      )
    }

    // Check for existing budget for this category and month
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId,
        month: monthStart,
      },
    })

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and month' },
        { status: 409 }
      )
    }

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        categoryId,
        amount: new Decimal(amount),
        month: monthStart,
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

    return NextResponse.json(
      {
        budget: {
          id: budget.id,
          categoryId: budget.categoryId,
          category: budget.category,
          amount: budget.amount.toNumber(),
          month: budget.month.toISOString(),
          spending: 0,
          remaining: budget.amount.toNumber(),
          percentage: 0,
          status: 'green' as const,
          createdAt: budget.createdAt.toISOString(),
          updatedAt: budget.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    )
  }
}
