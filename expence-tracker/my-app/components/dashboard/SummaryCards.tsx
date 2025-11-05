'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react'

interface SummaryCardsProps {
  totalExpenses: number
  totalIncome: number
  netBalance: number
  expenseCount?: number
  incomeCount?: number
}

export function SummaryCards({
  totalExpenses,
  totalIncome,
  netBalance,
  expenseCount = 0,
  incomeCount = 0,
}: SummaryCardsProps) {
  const isPositiveBalance = netBalance >= 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Expenses Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            ${totalExpenses.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {expenseCount} {expenseCount === 1 ? 'transaction' : 'transactions'}
          </p>
        </CardContent>
      </Card>

      {/* Total Income Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${totalIncome.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {incomeCount} {incomeCount === 1 ? 'transaction' : 'transactions'}
          </p>
        </CardContent>
      </Card>

      {/* Net Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <TrendingUp
            className={`h-4 w-4 ${
              isPositiveBalance ? 'text-green-600' : 'text-red-600'
            }`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isPositiveBalance ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositiveBalance ? '+' : ''}${netBalance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isPositiveBalance
              ? 'Surplus for period'
              : 'Deficit for period'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
