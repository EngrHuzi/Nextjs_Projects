import { z } from 'zod'

// Category create/update schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters'),
  type: z.enum(['EXPENSE', 'INCOME'], {
    required_error: 'Category type is required',
  }),
})

// Type export
export type CategoryInput = z.infer<typeof categorySchema>
