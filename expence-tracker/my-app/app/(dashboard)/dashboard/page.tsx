'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { TopCategories } from '@/components/dashboard/TopCategories'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { CategoryBarChart } from '@/components/charts/CategoryBarChart'
import { SpendingTrendChart } from '@/components/charts/SpendingTrendChart'
import { BudgetStatus } from '@/components/dashboard/BudgetStatus'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

// T146: Date range options
type DateRange = 'this_month' | 'last_30' | 'last_90' | 'this_year' | 'custom'

interface DashboardData {
  summary: {
    totalExpenses: number
    totalIncome: number
    netBalance: number
    expenseCount: number
    incomeCount: number
    totalTransactions: number
    startDate: string
    endDate: string
  }
  topCategories: Array<{
    name: string
    amount: number
    count: number
    percentage: number
  }>
}

interface ChartData {
  pieChart: Array<{
    name: string
    value: number
    percentage: number
  }>
  barChart: Array<{
    category: string
    expense: number
    income: number
  }>
  lineChart: Array<{
    date: string
    expense: number
    income: number
    net: number
  }>
}

interface Transaction {
  id: string
  type: 'EXPENSE' | 'INCOME'
  amount: number
  category: string
  date: string
  description?: string | null
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('this_month')
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // T147: Fetch dashboard data on mount and when date range changes
  useEffect(() => {
    fetchDashboardData()
  }, [dateRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Calculate date range
      const { startDate, endDate } = calculateDateRange(dateRange)

      // Fetch summary data (T135)
      const summaryResponse = await fetch(
        `/api/dashboard/summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch dashboard summary')
      }

      const summaryData = await summaryResponse.json()
      setDashboardData(summaryData)

      // Fetch chart data (T136)
      const chartResponse = await fetch(
        `/api/dashboard/chart-data?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (!chartResponse.ok) {
        throw new Error('Failed to fetch chart data')
      }

      const charts = await chartResponse.json()
      setChartData(charts)

      // Fetch recent transactions (last 10)
      const transactionsResponse = await fetch(
        `/api/transactions?limit=10&page=1`
      )

      if (!transactionsResponse.ok) {
        throw new Error('Failed to fetch recent transactions')
      }

      const transactionsData = await transactionsResponse.json()
      setRecentTransactions(transactionsData.transactions || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const calculateDateRange = (range: DateRange) => {
    const now = new Date()
    let startDate: Date
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    switch (range) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      case 'last_30':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30)
        break
      case 'last_90':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 90)
        break
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return { startDate, endDate }
  }

  // T169: PDF Export handler
  const handleExportPDF = async () => {
    try {
      const { startDate, endDate } = calculateDateRange(dateRange)

      // Trigger download
      const response = await fetch(
        `/api/export/pdf?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to export PDF')
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expense_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF report exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export PDF report')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4 bg-gradient-to-r from-green-600 to-blue-600"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Loading Dashboard
            </h2>
            <p className="text-muted-foreground">Fetching your financial data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData || !chartData) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="glass-card-strong max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
              Failed to Load
            </h2>
            <p className="text-muted-foreground">Unable to fetch dashboard data. Please try again.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header with Date Range Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your financial activity
          </p>
        </div>

        <div className="flex gap-3 items-center">
          {/* T169: Export PDF button */}
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>

          {/* T146: Date range filter dropdown */}
          <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_30">Last 30 Days</SelectItem>
              <SelectItem value="last_90">Last 90 Days</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* T143: Summary Cards */}
      <div className="mb-6">
        <SummaryCards
          totalExpenses={dashboardData.summary.totalExpenses}
          totalIncome={dashboardData.summary.totalIncome}
          netBalance={dashboardData.summary.netBalance}
          expenseCount={dashboardData.summary.expenseCount}
          incomeCount={dashboardData.summary.incomeCount}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* T149: Pie Chart */}
        <CategoryPieChart data={chartData.pieChart} />

        {/* T150: Bar Chart */}
        <CategoryBarChart data={chartData.barChart} />
      </div>

      {/* T151: Line Chart - Full Width */}
      <div className="mb-6">
        <SpendingTrendChart data={chartData.lineChart} />
      </div>

      {/* T155: Budget Status Section */}
      <div className="mb-6">
        <BudgetStatus />
      </div>

      {/* Bottom Row: Top Categories and Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* T144: Top Categories */}
        <TopCategories categories={dashboardData.topCategories} />

        {/* T145: Recent Transactions */}
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  )
}
