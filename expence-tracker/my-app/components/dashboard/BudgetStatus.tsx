'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Budget {
  id: string
  categoryId: string
  category: {
    id: string
    name: string
    type: string
  }
  amount: number
  month: string
  spending: number
  remaining: number
  percentage: number
  status: 'green' | 'yellow' | 'red'
}

interface BudgetStatusProps {
  month?: string // Optional month filter
}

export function BudgetStatus({ month }: BudgetStatusProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [month])

  const fetchBudgets = async () => {
    try {
      setLoading(true)

      // Use provided month or default to current month
      const targetMonth = month || new Date().toISOString().slice(0, 7)
      const response = await fetch(`/api/budgets?month=${targetMonth}-01`)

      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }

      const data = await response.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to load budget status')
    } finally {
      setLoading(false)
    }
  }

  // T156: Get progress bar color based on status
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500' // T156: Highlight yellow (70-90%)
      case 'red':
        return 'bg-red-500' // T156: Highlight red (>90%)
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>Your monthly budget progress</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading budgets...</p>
        </CardContent>
      </Card>
    )
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>Your monthly budget progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No budgets set for this period
            </p>
            <Link href="/budgets">
              <Button variant="outline">Create Budget</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // T156: Count budgets by status for summary
  const atRisk = budgets.filter((b) => b.status === 'red').length
  const warning = budgets.filter((b) => b.status === 'yellow').length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Status</CardTitle>
          <CardDescription>
            {budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'} tracked
            {atRisk > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                • {atRisk} over budget
              </span>
            )}
            {warning > 0 && atRisk === 0 && (
              <span className="ml-2 text-yellow-600 font-semibold">
                • {warning} near limit
              </span>
            )}
          </CardDescription>
        </div>
        <Link href="/budgets">
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{budget.category.name}</span>
                  {/* T156: Show alert icon for yellow/red budgets */}
                  {(budget.status === 'yellow' || budget.status === 'red') && (
                    <AlertCircle
                      className={`h-4 w-4 ${
                        budget.status === 'red' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    ${budget.spending.toFixed(0)} / ${budget.amount.toFixed(0)}
                  </span>
                  <span
                    className={`font-semibold ${
                      budget.status === 'red'
                        ? 'text-red-600'
                        : budget.status === 'yellow'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(budget.percentage, 100)}
                className="h-2"
                indicatorClassName={getProgressColor(budget.status)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
