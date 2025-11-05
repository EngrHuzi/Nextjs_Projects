import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'
import { z } from 'zod'

// Query schema for date range and chart type
const chartDataQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  type: z.enum(['pie', 'bar', 'line']).optional(),
})

// T136: GET /api/dashboard/chart-data - Data for pie, bar, line charts
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
      type: searchParams.get('type') || undefined,
    }

    const validated = chartDataQuerySchema.safeParse(queryParams)
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

    // Fetch all transactions in date range
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
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // T139: Pie chart data - category breakdown with amounts and percentages
    const pieChartData = calculatePieChartData(transactions)

    // T140: Bar chart data - category comparison for selected period
    const barChartData = calculateBarChartData(transactions)

    // T141: Line chart data - daily spending totals
    const lineChartData = calculateLineChartData(transactions, startDate, endDate)

    // Return requested chart type or all data
    const chartType = validated.data.type

    if (chartType === 'pie') {
      return NextResponse.json({ pieChart: pieChartData })
    } else if (chartType === 'bar') {
      return NextResponse.json({ barChart: barChartData })
    } else if (chartType === 'line') {
      return NextResponse.json({ lineChart: lineChartData })
    }

    // Return all chart data if no specific type requested
    return NextResponse.json({
      pieChart: pieChartData,
      barChart: barChartData,
      lineChart: lineChartData,
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}

// T139: Calculate pie chart data
function calculatePieChartData(transactions: any[]) {
  const categoryMap = new Map<string, Decimal>()
  let totalExpenses = new Decimal(0)

  // Sum expenses by category
  transactions.forEach((tx) => {
    if (tx.type === 'EXPENSE') {
      const category = tx.category
      const amount = new Decimal(tx.amount.toString())

      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category)!.plus(amount))
      } else {
        categoryMap.set(category, amount)
      }

      totalExpenses = totalExpenses.plus(amount)
    }
  })

  // Convert to array with percentages
  const data = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      name: category,
      value: amount.toNumber(),
      percentage: totalExpenses.isZero()
        ? 0
        : amount.dividedBy(totalExpenses).times(100).toNumber(),
    }))
    .sort((a, b) => b.value - a.value)

  return data
}

// T140: Calculate bar chart data
function calculateBarChartData(transactions: any[]) {
  const categoryMap = new Map<string, { expense: Decimal; income: Decimal }>()

  // Sum by category and type
  transactions.forEach((tx) => {
    const category = tx.category
    const amount = new Decimal(tx.amount.toString())

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        expense: new Decimal(0),
        income: new Decimal(0),
      })
    }

    const categoryData = categoryMap.get(category)!
    if (tx.type === 'EXPENSE') {
      categoryData.expense = categoryData.expense.plus(amount)
    } else if (tx.type === 'INCOME') {
      categoryData.income = categoryData.income.plus(amount)
    }
  })

  // Convert to array
  const data = Array.from(categoryMap.entries())
    .map(([category, amounts]) => ({
      category,
      expense: amounts.expense.toNumber(),
      income: amounts.income.toNumber(),
    }))
    .sort((a, b) => b.expense - a.expense) // Sort by expense amount

  return data
}

// T141: Calculate line chart data - daily spending totals
function calculateLineChartData(
  transactions: any[],
  startDate: Date,
  endDate: Date
) {
  // Create a map for daily totals
  const dailyMap = new Map<string, { expense: Decimal; income: Decimal }>()

  // Initialize all days in range with zero
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyMap.set(dateKey, {
      expense: new Decimal(0),
      income: new Decimal(0),
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sum transactions by date
  transactions.forEach((tx) => {
    const dateKey = new Date(tx.date).toISOString().split('T')[0]
    const amount = new Decimal(tx.amount.toString())

    if (dailyMap.has(dateKey)) {
      const dayData = dailyMap.get(dateKey)!
      if (tx.type === 'EXPENSE') {
        dayData.expense = dayData.expense.plus(amount)
      } else if (tx.type === 'INCOME') {
        dayData.income = dayData.income.plus(amount)
      }
    }
  })

  // Convert to array sorted by date
  const data = Array.from(dailyMap.entries())
    .map(([date, amounts]) => ({
      date,
      expense: amounts.expense.toNumber(),
      income: amounts.income.toNumber(),
      net: amounts.income.minus(amounts.expense).toNumber(),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return data
}
