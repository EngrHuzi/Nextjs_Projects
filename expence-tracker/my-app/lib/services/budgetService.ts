import { Decimal } from 'decimal.js'
import { prisma } from '@/lib/prisma'

export interface BudgetProgress {
  budgetId: string
  categoryId: string
  categoryName: string
  budgetAmount: number
  spending: number
  remaining: number
  percentage: number
  status: 'green' | 'yellow' | 'red'
  month: Date
}

/**
 * Calculate budget progress for a specific budget
 * T117: SUM(transactions WHERE category = X AND date >= month start AND date < month end AND type = EXPENSE)
 */
export async function calculateBudgetProgress(
  budgetId: string,
  userId: string
): Promise<BudgetProgress | null> {
  try {
    // Fetch budget with category info
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!budget) {
      return null
    }

    // Calculate month boundaries
    const monthStart = new Date(budget.month.getFullYear(), budget.month.getMonth(), 1)
    const monthEnd = new Date(
      budget.month.getFullYear(),
      budget.month.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    // Fetch all expense transactions for this category in the month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
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

    // T120: Calculate remaining amount: budget - spending
    const remaining = budgetAmount.minus(spending)

    // T118: Calculate percentage: (spending / budget amount) * 100
    const percentage = budgetAmount.isZero()
      ? 0
      : spending.dividedBy(budgetAmount).times(100).toNumber()

    // T119: Determine status: green (<70%), yellow (70-90%), red (>90%)
    let status: 'green' | 'yellow' | 'red'
    if (percentage < 70) {
      status = 'green'
    } else if (percentage < 90) {
      status = 'yellow'
    } else {
      status = 'red'
    }

    return {
      budgetId: budget.id,
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      budgetAmount: budgetAmount.toNumber(),
      spending: spending.toNumber(),
      remaining: remaining.toNumber(),
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
      status,
      month: budget.month,
    }
  } catch (error) {
    console.error('Error calculating budget progress:', error)
    return null
  }
}

/**
 * Calculate progress for all budgets of a user for a specific month
 */
export async function calculateAllBudgetProgress(
  userId: string,
  month?: Date
): Promise<BudgetProgress[]> {
  try {
    // Default to current month
    const targetDate = month || new Date()
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    const monthEnd = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    // Fetch all budgets for user in the target month
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
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
          },
        },
      },
    })

    // Calculate progress for each budget
    const progressList = await Promise.all(
      budgets.map(async (budget) => {
        const progress = await calculateBudgetProgress(budget.id, userId)
        return progress
      })
    )

    // Filter out nulls and return
    return progressList.filter((p): p is BudgetProgress => p !== null)
  } catch (error) {
    console.error('Error calculating all budget progress:', error)
    return []
  }
}

/**
 * Get budget progress summary statistics
 */
export async function getBudgetSummary(userId: string, month?: Date) {
  const progressList = await calculateAllBudgetProgress(userId, month)

  const totalBudget = progressList.reduce((sum, p) => sum + p.budgetAmount, 0)
  const totalSpending = progressList.reduce((sum, p) => sum + p.spending, 0)
  const totalRemaining = progressList.reduce((sum, p) => sum + p.remaining, 0)

  const budgetsAtRisk = progressList.filter((p) => p.status === 'red').length
  const budgetsWarning = progressList.filter((p) => p.status === 'yellow').length
  const budgetsHealthy = progressList.filter((p) => p.status === 'green').length

  return {
    totalBudget,
    totalSpending,
    totalRemaining,
    overallPercentage:
      totalBudget > 0 ? Math.round((totalSpending / totalBudget) * 1000) / 10 : 0,
    budgetsAtRisk,
    budgetsWarning,
    budgetsHealthy,
    totalBudgets: progressList.length,
  }
}
