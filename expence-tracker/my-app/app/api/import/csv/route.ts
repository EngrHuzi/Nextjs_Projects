import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'
import { Decimal } from 'decimal.js'

// T174: CSV row schema for validation
const csvRowSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['EXPENSE', 'INCOME', 'expense', 'income']),
  amount: z.string().min(1, 'Amount is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER', 'cash', 'card', 'bank_transfer', 'other']).optional(),
})

// T172: POST /api/import/csv - Import transactions from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    // Read file content
    const fileContent = await file.text()

    // T173: Parse CSV file
    let records: any[]
    try {
      records = parse(fileContent, {
        columns: true, // Use first row as header
        skip_empty_lines: true,
        trim: true,
        // T176: Handle common column name variations (case-insensitive)
        onRecord: (record: any) => {
          const normalized: any = {}
          for (const [key, value] of Object.entries(record)) {
            const lowerKey = key.toLowerCase()
            normalized[lowerKey] = value
          }
          return normalized
        },
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid CSV format', details: String(error) },
        { status: 400 }
      )
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    // T177: Parse and validate transactions
    const parsedTransactions: Array<{
      date: Date
      type: 'EXPENSE' | 'INCOME'
      amount: Decimal
      category: string
      description?: string
      paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER'
    }> = []

    const errors: Array<{ row: number; error: string }> = []

    for (let i = 0; i < records.length; i++) {
      const record = records[i]

      try {
        // T174-T175: Validate CSV columns and data types
        const validated = csvRowSchema.safeParse(record)

        if (!validated.success) {
          errors.push({
            row: i + 2, // +2 because row 1 is header and arrays are 0-indexed
            error: validated.error.issues.map((e) => e.message).join(', '),
          })
          continue
        }

        // Parse date
        const date = new Date(validated.data.date)
        if (isNaN(date.getTime())) {
          errors.push({ row: i + 2, error: 'Invalid date format' })
          continue
        }

        // Parse amount
        const amount = parseFloat(validated.data.amount)
        if (isNaN(amount) || amount <= 0) {
          errors.push({ row: i + 2, error: 'Amount must be a positive number' })
          continue
        }

        // Normalize type
        const type = validated.data.type.toUpperCase() as 'EXPENSE' | 'INCOME'

        // Normalize payment method (default to CASH if not provided)
        let paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER' = 'CASH'
        if (validated.data.paymentMethod) {
          const pm = validated.data.paymentMethod.toUpperCase()
          if (pm === 'BANK_TRANSFER') {
            paymentMethod = 'BANK_TRANSFER'
          } else if (pm === 'CARD') {
            paymentMethod = 'CARD'
          } else if (pm === 'OTHER') {
            paymentMethod = 'OTHER'
          }
        }

        parsedTransactions.push({
          date,
          type,
          amount: new Decimal(amount),
          category: validated.data.category,
          description: validated.data.description || undefined,
          paymentMethod,
        })
      } catch (error) {
        errors.push({
          row: i + 2,
          error: `Parse error: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }

    // Return preview data (T177: Show preview before import)
    if (formData.get('preview') === 'true') {
      return NextResponse.json({
        preview: parsedTransactions.slice(0, 10).map((tx) => ({
          ...tx,
          amount: tx.amount.toNumber(),
          date: tx.date.toISOString(),
        })),
        totalRows: parsedTransactions.length,
        errors: errors.slice(0, 10),
        totalErrors: errors.length,
      })
    }

    // T178: Detect potential duplicates
    const duplicates: Array<{ row: number; reason: string }> = []

    for (let i = 0; i < parsedTransactions.length; i++) {
      const tx = parsedTransactions[i]

      // Check for existing transaction with same date, amount, and description
      const existing = await prisma.transaction.findFirst({
        where: {
          userId: session.user.id,
          date: {
            gte: new Date(tx.date.getTime() - 1000), // Within 1 second
            lte: new Date(tx.date.getTime() + 1000),
          },
          amount: tx.amount.toNumber(),
          description: tx.description,
        },
      })

      if (existing) {
        duplicates.push({
          row: i + 2,
          reason: `Possible duplicate: transaction with same date, amount, and description already exists`,
        })
      }
    }

    // T180: Batch insert transactions (use Prisma createMany)
    try {
      const result = await prisma.transaction.createMany({
        data: parsedTransactions.map((tx) => ({
          userId: session.user.id,
          date: tx.date,
          type: tx.type,
          amount: tx.amount.toNumber(),
          category: tx.category,
          description: tx.description,
          paymentMethod: tx.paymentMethod,
        })),
        skipDuplicates: false, // We want to catch errors
      })

      // T181: Return import summary
      return NextResponse.json({
        success: true,
        imported: result.count,
        total: parsedTransactions.length,
        errors: errors.length,
        duplicates: duplicates.length,
        errorDetails: errors.slice(0, 10),
        duplicateDetails: duplicates.slice(0, 10),
      })
    } catch (error) {
      console.error('Error importing transactions:', error)
      return NextResponse.json(
        { error: 'Failed to import transactions', details: String(error) },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing CSV import:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    )
  }
}
