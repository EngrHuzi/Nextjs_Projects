import { z } from 'zod'

// Transaction create/update schema
export const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME'], {
    message: 'Transaction type is required',
  }),
  amount: z
    .number({
      message: 'Amount must be a number',
    })
    .positive('Amount must be greater than 0')
    .max(99999999.99, 'Amount cannot exceed $99,999,999.99')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  category: z.string().min(1, 'Category is required').max(100, 'Category name too long'),
  date: z.coerce.date({
    message: 'Invalid date format',
  }).refine((date) => date <= new Date(), {
    message: 'Date cannot be in the future',
  }),
  description: z
    .string()
    .max(200, 'Description cannot exceed 200 characters')
    .optional()
    .nullable(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER'], {
    message: 'Payment method is required',
  }),
})

// Transaction list query schema
export const transactionListQuerySchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// Type exports
export type TransactionInput = Omit<z.infer<typeof transactionSchema>, 'date'> & { date: Date }
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>
