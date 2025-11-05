import { z } from 'zod'

// Budget create/update schema
export const budgetSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  amount: z
    .number({
      required_error: 'Budget amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(1000000, 'Budget amount cannot exceed $1,000,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  month: z.coerce.date({
    required_error: 'Month is required',
    invalid_type_error: 'Invalid date format',
  }),
})

// Type export
export type BudgetInput = z.infer<typeof budgetSchema>
