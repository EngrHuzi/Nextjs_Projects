import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'
import { z } from 'zod'

// Query schema for date range
const summaryQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

// T135: GET /api/dashboard/summary - Current month totals, top categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const queryParams = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }

    const validated = summaryQuerySchema.safeParse(queryParams)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validated.error.errors },
        { status: 400 }
      )
    }

    // Default to current month if no dates provided
    const now = new Date()
    const startDate = validated.data.startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = validated.data.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // T137: Calculate summary - total expenses, total income, net balance
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        type: true,
        amount: true,
        category: true,
        categoryId: true,
      },
    })

    // Calculate totals using Decimal for precision
    let totalExpenses = new Decimal(0)
    let totalIncome = new Decimal(0)

    transactions.forEach((tx) => {
      const amount = new Decimal(tx.amount.toString())
      if (tx.type === 'EXPENSE') {
        totalExpenses = totalExpenses.plus(amount)
      } else if (tx.type === 'INCOME') {
        totalIncome = totalIncome.plus(amount)
      }
    })

    const netBalance = totalIncome.minus(totalExpenses)

    // T138: Top categories - GROUP BY category, ORDER BY SUM(amount) DESC, LIMIT 5
    const categoryMap = new Map<string, { name: string; amount: Decimal; count: number }>()

    transactions.forEach((tx) => {
      if (tx.type === 'EXPENSE') {
        const category = tx.category
        const amount = new Decimal(tx.amount.toString())

        if (categoryMap.has(category)) {
          const existing = categoryMap.get(category)!
          categoryMap.set(category, {
            name: category,
            amount: existing.amount.plus(amount),
            count: existing.count + 1,
          })
        } else {
          categoryMap.set(category, {
            name: category,
            amount,
            count: 1,
          })
        }
      }
    })

    // Convert to array and sort by amount descending
    const topCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.amount.comparedTo(a.amount))
      .slice(0, 5)
      .map((cat) => ({
        name: cat.name,
        amount: cat.amount.toNumber(),
        count: cat.count,
        percentage: totalExpenses.isZero()
          ? 0
          : cat.amount.dividedBy(totalExpenses).times(100).toNumber(),
      }))

    // Calculate transaction counts
    const expenseCount = transactions.filter((tx) => tx.type === 'EXPENSE').length
    const incomeCount = transactions.filter((tx) => tx.type === 'INCOME').length

    return NextResponse.json({
      summary: {
        totalExpenses: totalExpenses.toNumber(),
        totalIncome: totalIncome.toNumber(),
        netBalance: netBalance.toNumber(),
        expenseCount,
        incomeCount,
        totalTransactions: transactions.length,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      topCategories,
    })
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    )
  }
}
