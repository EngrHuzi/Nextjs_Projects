'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// Form schema
const budgetFormSchema = z.object({
  categoryId: z.string().uuid('Please select a category'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be greater than 0',
    })
    .refine((val) => Number(val) <= 1000000, {
      message: 'Amount cannot exceed $1,000,000',
    }),
  month: z.string().min(1, 'Month is required'),
})

type BudgetFormValues = z.infer<typeof budgetFormSchema>

interface BudgetFormProps {
  budgetId?: string
  initialAmount?: number
  defaultMonth?: string
  onSuccess?: () => void
}

interface Category {
  id: string
  name: string
  type: string
  isPredefined: boolean
}

export function BudgetForm({
  budgetId,
  initialAmount,
  defaultMonth,
  onSuccess,
}: BudgetFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const isEditMode = !!budgetId

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: '',
      amount: initialAmount?.toString() || '',
      month: defaultMonth || new Date().toISOString().slice(0, 7),
    },
  })

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = await response.json()

        // Filter for expense categories only (budgets are only for expenses)
        const expenseCategories = (data.categories || []).filter(
          (cat: Category) => cat.type === 'EXPENSE'
        )

        setCategories(expenseCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  const onSubmit = async (data: BudgetFormValues) => {
    try {
      setLoading(true)

      const budgetData = {
        categoryId: data.categoryId,
        amount: Number(data.amount),
        month: `${data.month}-01`, // Convert YYYY-MM to YYYY-MM-DD
      }

      const url = isEditMode ? `/api/budgets/${budgetId}` : '/api/budgets'
      const method = isEditMode ? 'PUT' : 'POST'

      // For edit mode, only send amount
      const payload = isEditMode ? { amount: budgetData.amount } : budgetData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} budget`)
      }

      toast.success(`Budget ${isEditMode ? 'updated' : 'created'} successfully`)

      // Reset form if creating
      if (!isEditMode) {
        form.reset()
      }

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} budget:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} budget`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!isEditMode && (
          <>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                          {category.isPredefined && ' (Default)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the expense category you want to budget for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormDescription>
                    Select the month for this budget
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1000000"
                    placeholder="0.00"
                    className="pl-7"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Set your spending limit for this category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
              ? 'Update Budget'
              : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
