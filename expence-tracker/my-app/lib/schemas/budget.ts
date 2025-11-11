import { z } from 'zod'

// Budget create/update schema
export const budgetSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  amount: z
    .number({
      message: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(1000000, 'Budget amount cannot exceed $1,000,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  month: z
    .preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
      return arg
    }, z.date({
      message: 'Invalid date format',
    })),
})

// Type export
export type BudgetInput = Omit<z.infer<typeof budgetSchema>, 'month'> & {
  month: Date
}
