'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionInput } from '@/lib/schemas/transaction'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

interface Transaction {
  id: string
  type: 'EXPENSE' | 'INCOME'
  amount: number
  category: string
  date: Date | string
  description: string | null
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER'
}

interface TransactionFormProps {
  transaction?: Transaction | null
  onSuccess: () => void
  onCancel: () => void
}

interface Category {
  id: string
  name: string
  type: 'EXPENSE' | 'INCOME'
  isPredefined: boolean
}

interface CategorySuggestion {
  category: string
  confidence: number
  reason: string
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<'EXPENSE' | 'INCOME'>(
    transaction?.type || 'EXPENSE'
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null)
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [suggestionAccepted, setSuggestionAccepted] = useState(false)

  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'EXPENSE',
      amount: transaction?.amount || 0,
      category: transaction?.category || '',
      date: transaction?.date
        ? new Date(transaction.date)
        : new Date(),
      description: transaction?.description || '',
      paymentMethod: transaction?.paymentMethod || 'CASH',
    },
  })

  // T110: Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()

        if (response.ok) {
          setCategories(data.categories)
        } else {
          console.error('Failed to fetch categories:', data.error)
        }
      } catch (error) {
        console.error('Fetch categories error:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Watch type field to update categories
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type' && value.type) {
        setSelectedType(value.type as 'EXPENSE' | 'INCOME')
        // Reset category when type changes
        form.setValue('category', '')
        // Clear suggestion when type changes
        setSuggestion(null)
        setSuggestionAccepted(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // T192: Fetch category suggestion when description changes (debounced)
  const fetchSuggestion = useCallback(async (description: string, type: 'EXPENSE' | 'INCOME') => {
    if (!description || description.trim().length < 3) {
      setSuggestion(null)
      return
    }

    setIsLoadingSuggestion(true)
    try {
      const response = await fetch('/api/suggestions/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, type })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.suggestion && data.suggestion.confidence >= 50) {
          setSuggestion(data.suggestion)
        } else {
          setSuggestion(null)
        }
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error)
      setSuggestion(null)
    } finally {
      setIsLoadingSuggestion(false)
    }
  }, [])

  // Watch description field for changes (with debouncing)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'description' && value.description) {
        // Don't fetch if user already accepted a suggestion
        if (suggestionAccepted) {
          return
        }

        // Debounce: wait 300ms after user stops typing
        const timeoutId = setTimeout(() => {
          fetchSuggestion(value.description as string, selectedType)
        }, 300)

        return () => clearTimeout(timeoutId)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, selectedType, fetchSuggestion, suggestionAccepted])

  // T194: Handle suggestion click - auto-fill category
  const handleAcceptSuggestion = useCallback(() => {
    if (suggestion) {
      form.setValue('category', suggestion.category)
      setSuggestionAccepted(true)
      toast.success(`Category set to "${suggestion.category}"`)
    }
  }, [suggestion, form])

  async function onSubmit(data: TransactionInput) {
    setIsSubmitting(true)

    try {
      const url = transaction
        ? `/api/transactions/${transaction.id}`
        : '/api/transactions'

      const response = await fetch(url, {
        method: transaction ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save transaction')
      }

      // T195: Track suggestion acceptance rate
      if (suggestion && suggestionAccepted && data.category === suggestion.category) {
        console.log('AI Suggestion accepted:', {
          category: suggestion.category,
          confidence: suggestion.confidence,
          method: 'user_accepted'
        })
        // Future: Could send to analytics endpoint for model training
      }

      toast.success(
        transaction
          ? 'Transaction updated successfully'
          : 'Transaction created successfully'
      )
      onSuccess()
    } catch (error) {
      console.error('Transaction form error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  // T111: Filter categories by transaction type
  const filteredCategories = categories
    .filter((cat) => cat.type === selectedType)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === '' ? 0 : parseFloat(value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Category</FormLabel>
                {/* T193: Show AI suggestion badge */}
                {suggestion && !suggestionAccepted && (
                  <button
                    type="button"
                    onClick={handleAcceptSuggestion}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Sparkles className="h-3 w-3" />
                    {suggestion.category} ({suggestion.confidence}%)
                  </button>
                )}
                {isLoadingSuggestion && (
                  <span className="text-xs text-muted-foreground">
                    Thinking...
                  </span>
                )}
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCategories ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Loading categories...
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No categories available
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {/* Show suggestion reason as help text */}
              {suggestion && !suggestionAccepted && (
                <p className="text-xs text-muted-foreground mt-1">
                  {suggestion.reason}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().split('T')[0]
                      : (field.value as string) || ''
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter description..."
                  disabled={isSubmitting}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : transaction
                ? 'Update Transaction'
                : 'Create Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
