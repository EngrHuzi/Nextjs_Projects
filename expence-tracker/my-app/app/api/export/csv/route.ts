import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Query schema for filtering
const exportQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  type: z.enum(['EXPENSE', 'INCOME']).optional(),
  category: z.string().optional(),
})

// T157: GET /api/export/csv - Export transactions to CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const queryParams = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
    }

    const validated = exportQuerySchema.safeParse(queryParams)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validated.error.errors },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (validated.data.startDate || validated.data.endDate) {
      where.date = {}
      if (validated.data.startDate) {
        where.date.gte = validated.data.startDate
      }
      if (validated.data.endDate) {
        where.date.lte = validated.data.endDate
      }
    }

    if (validated.data.type) {
      where.type = validated.data.type
    }

    if (validated.data.category) {
      where.category = validated.data.category
    }

    // Fetch transactions (T159: Handle large datasets efficiently)
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      select: {
        date: true,
        type: true,
        amount: true,
        category: true,
        description: true,
        paymentMethod: true,
      },
    })

    // T158: Generate CSV with headers
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Payment Method']

    // Convert transactions to CSV rows
    const rows = transactions.map((tx) => {
      return [
        tx.date.toISOString().split('T')[0], // Date in YYYY-MM-DD format
        tx.type,
        tx.amount.toFixed(2), // Format with 2 decimal places
        tx.category,
        tx.description || '',
        tx.paymentMethod,
      ]
    })

    // Build CSV content (T159: Stream-friendly approach for large datasets)
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          // Escape cells that contain commas, quotes, or newlines
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      ),
    ].join('\n')

    // T160: Set Content-Disposition header with filename including date range
    const startDateStr = validated.data.startDate
      ? validated.data.startDate.toISOString().split('T')[0]
      : 'all'
    const endDateStr = validated.data.endDate
      ? validated.data.endDate.toISOString().split('T')[0]
      : 'all'
    const filename = `transactions_${startDateStr}_to_${endDateStr}.csv`

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    )
  }
}
