import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { transactionListQuerySchema } from '@/lib/schemas/transaction'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const queryParams = {
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    }

    // Validate query parameters
    const validatedQuery = transactionListQuerySchema.parse(queryParams)

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (validatedQuery.type) {
      where.type = validatedQuery.type
    }

    if (validatedQuery.category) {
      where.category = validatedQuery.category
    }

    if (validatedQuery.paymentMethod) {
      where.paymentMethod = validatedQuery.paymentMethod
    }

    if (validatedQuery.startDate || validatedQuery.endDate) {
      where.date = {}
      if (validatedQuery.startDate) {
        where.date.gte = validatedQuery.startDate
      }
      if (validatedQuery.endDate) {
        where.date.lte = validatedQuery.endDate
      }
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit

    // Fetch transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: {
          date: 'desc',
        },
        skip,
        take: validatedQuery.limit,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          date: true,
          description: true,
          paymentMethod: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    })
  } catch (error) {
    console.error('List transactions error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// T069: POST /api/transactions (create)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Import at runtime to avoid circular dependency
    const { transactionSchema } = await import('@/lib/schemas/transaction')
    const validatedData = transactionSchema.parse(body)

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: validatedData.type,
        amount: validatedData.amount,
        category: validatedData.category,
        categoryId: body.categoryId, // Optional categoryId for budget tracking
        date: validatedData.date,
        description: validatedData.description,
        paymentMethod: validatedData.paymentMethod,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        category: true,
        categoryId: true,
        date: true,
        description: true,
        paymentMethod: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // T133: Check budget alert after transaction create (for EXPENSE transactions only)
    if (transaction.type === 'EXPENSE' && transaction.categoryId) {
      const { checkBudgetAlert, storeAlert } = await import('@/lib/services/alertService')
      const alert = await checkBudgetAlert(
        session.user.id,
        transaction.categoryId,
        transaction.date
      )

      if (alert) {
        storeAlert(session.user.id, alert)

        // Return alert in response so UI can display it
        return NextResponse.json(
          {
            transaction,
            alert: {
              type: alert.type,
              message: alert.message,
            }
          },
          { status: 201 }
        )
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid transaction data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
