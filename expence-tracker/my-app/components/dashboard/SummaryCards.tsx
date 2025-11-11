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
      <Card className="border-red-200/50 dark:border-red-900/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
            <ArrowDown className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            ${totalExpenses.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {expenseCount} {expenseCount === 1 ? 'transaction' : 'transactions'}
          </p>
        </CardContent>
      </Card>

      {/* Total Income Card */}
      <Card className="border-green-200/50 dark:border-green-900/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
            <ArrowUp className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            ${totalIncome.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {incomeCount} {incomeCount === 1 ? 'transaction' : 'transactions'}
          </p>
        </CardContent>
      </Card>

      {/* Net Balance Card */}
      <Card className={`border-${isPositiveBalance ? 'blue' : 'orange'}-200/50 dark:border-${isPositiveBalance ? 'blue' : 'orange'}-900/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${isPositiveBalance ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600'} flex items-center justify-center shadow-md`}>
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold bg-gradient-to-r ${
              isPositiveBalance ? 'from-blue-600 to-indigo-600' : 'from-orange-600 to-red-600'
            } bg-clip-text text-transparent`}
          >
            {isPositiveBalance ? '+' : ''}${netBalance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isPositiveBalance
              ? 'Surplus for period'
              : 'Deficit for period'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
