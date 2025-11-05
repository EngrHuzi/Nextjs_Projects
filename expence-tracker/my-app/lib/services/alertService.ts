import { calculateBudgetProgress } from './budgetService'
import { prisma } from '@/lib/prisma'

export interface BudgetAlert {
  type: '90%' | '100%'
  budgetId: string
  categoryName: string
  budgetAmount: number
  spending: number
  percentage: number
  message: string
}

/**
 * T122: Check if budget alert should be triggered
 * Triggered on transaction create/update/delete
 * T123: Check if spending >= 90% and < 100% → create 90% alert
 * T124: Check if spending >= 100% → create 100% alert
 * T205-T206: Check user preferences before showing alerts
 */
export async function checkBudgetAlert(
  userId: string,
  categoryId: string,
  transactionMonth: Date
): Promise<BudgetAlert | null> {
  try {
    // T206: Check if user has budget alerts enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { budgetAlertsEnabled: true }
    })

    // T205: Respect global budgetAlertsEnabled setting
    if (!user || !user.budgetAlertsEnabled) {
      // User has disabled budget alerts globally
      return null
    }

    // Find budget for this category and month
    const monthStart = new Date(
      transactionMonth.getFullYear(),
      transactionMonth.getMonth(),
      1
    )
    const monthEnd = new Date(
      transactionMonth.getFullYear(),
      transactionMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )

    const budget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId,
        month: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    if (!budget) {
      // No budget set for this category/month, no alert
      return null
    }

    // Calculate current progress
    const progress = await calculateBudgetProgress(budget.id, userId)

    if (!progress) {
      return null
    }

    // T123: Check if spending >= 90% and < 100% → create 90% alert
    if (progress.percentage >= 90 && progress.percentage < 100) {
      return {
        type: '90%',
        budgetId: progress.budgetId,
        categoryName: progress.categoryName,
        budgetAmount: progress.budgetAmount,
        spending: progress.spending,
        percentage: progress.percentage,
        message: `Warning: You've used ${progress.percentage.toFixed(1)}% of your ${progress.categoryName} budget ($${progress.spending.toFixed(2)} of $${progress.budgetAmount.toFixed(2)})`,
      }
    }

    // T124: Check if spending >= 100% → create 100% alert
    if (progress.percentage >= 100) {
      const overspend = progress.spending - progress.budgetAmount
      return {
        type: '100%',
        budgetId: progress.budgetId,
        categoryName: progress.categoryName,
        budgetAmount: progress.budgetAmount,
        spending: progress.spending,
        percentage: progress.percentage,
        message: `Alert: You've exceeded your ${progress.categoryName} budget by $${overspend.toFixed(2)} (${progress.percentage.toFixed(1)}% used)`,
      }
    }

    // No alert needed (spending < 90%)
    return null
  } catch (error) {
    console.error('Error checking budget alert:', error)
    return null
  }
}

/**
 * Check alerts for multiple categories (useful for bulk transaction imports)
 */
export async function checkMultipleBudgetAlerts(
  userId: string,
  categoryIds: string[],
  transactionMonth: Date
): Promise<BudgetAlert[]> {
  try {
    const alerts = await Promise.all(
      categoryIds.map(async (categoryId) => {
        return checkBudgetAlert(userId, categoryId, transactionMonth)
      })
    )

    // Filter out null alerts
    return alerts.filter((alert): alert is BudgetAlert => alert !== null)
  } catch (error) {
    console.error('Error checking multiple budget alerts:', error)
    return []
  }
}

/**
 * T125: Store alerts in-app (for MVP, we'll use in-memory storage)
 * In production, this would be stored in a database table or notification queue
 */
const alertQueue: Map<string, BudgetAlert[]> = new Map()

export function storeAlert(userId: string, alert: BudgetAlert) {
  const userAlerts = alertQueue.get(userId) || []

  // Check if alert already exists (avoid duplicates)
  const exists = userAlerts.some(
    (a) => a.budgetId === alert.budgetId && a.type === alert.type
  )

  if (!exists) {
    userAlerts.push(alert)
    alertQueue.set(userId, userAlerts)
  }
}

/**
 * Get all pending alerts for a user
 */
export function getPendingAlerts(userId: string): BudgetAlert[] {
  return alertQueue.get(userId) || []
}

/**
 * Clear alerts for a user (after they've been displayed)
 */
export function clearAlerts(userId: string) {
  alertQueue.delete(userId)
}

/**
 * Clear a specific alert
 */
export function clearAlert(userId: string, budgetId: string, type: '90%' | '100%') {
  const userAlerts = alertQueue.get(userId) || []
  const filteredAlerts = userAlerts.filter(
    (alert) => !(alert.budgetId === budgetId && alert.type === type)
  )

  if (filteredAlerts.length > 0) {
    alertQueue.set(userId, filteredAlerts)
  } else {
    alertQueue.delete(userId)
  }
}

/**
 * Get alert summary count for a user
 */
export function getAlertCount(userId: string): number {
  return (alertQueue.get(userId) || []).length
}
