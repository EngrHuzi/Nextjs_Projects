'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
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
  createdAt: string
  updatedAt: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/budgets?month=${currentMonth}-01`)

      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }

      const data = await response.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [currentMonth])

  // Delete budget
  const handleDelete = async (budgetId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the budget for ${categoryName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete budget')
      }

      toast.success('Budget deleted successfully')
      fetchBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Failed to delete budget')
    }
  }

  // Get progress bar color
  const getProgressColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'red':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || ''}`}>
        {status === 'green' && 'On Track'}
        {status === 'yellow' && 'Warning'}
        {status === 'red' && 'Over Budget'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Budgets</h1>
        <p className="text-muted-foreground">Loading budgets...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-2">
            Track your spending against monthly budgets
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Budget</DialogTitle>
                <DialogDescription>
                  Set a monthly spending limit for a category
                </DialogDescription>
              </DialogHeader>
              <BudgetForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false)
                  fetchBudgets()
                }}
                defaultMonth={currentMonth}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first budget to start tracking your spending
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{budget.category.name}</CardTitle>
                    <CardDescription>
                      {new Date(budget.month).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                  <div>{getStatusBadge(budget.status)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">
                        ${budget.spending.toFixed(2)} / ${budget.amount.toFixed(2)}
                      </span>
                      <span className="font-medium">{budget.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(budget.percentage, 100)}
                      className="h-2"
                      indicatorClassName={getProgressColor(budget.status)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className={`font-semibold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${Math.abs(budget.remaining).toFixed(2)}
                        {budget.remaining < 0 && ' over'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold">${budget.amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Dialog open={isEditDialogOpen && selectedBudget?.id === budget.id} onOpenChange={(open) => {
                      setIsEditDialogOpen(open)
                      if (!open) setSelectedBudget(null)
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedBudget(budget)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Budget</DialogTitle>
                          <DialogDescription>
                            Update the budget amount for {budget.category.name}
                          </DialogDescription>
                        </DialogHeader>
                        <BudgetForm
                          budgetId={budget.id}
                          initialAmount={budget.amount}
                          onSuccess={() => {
                            setIsEditDialogOpen(false)
                            setSelectedBudget(null)
                            fetchBudgets()
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(budget.id, budget.category.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
