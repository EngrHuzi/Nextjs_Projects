import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/schemas/transaction'

// T070: GET /api/transactions/[id] (get single transaction)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id, // Row-level security
      },
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
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Convert Decimal amount to number for JSON serialization
    const serializedTransaction = {
      ...transaction,
      amount: transaction.amount.toNumber(),
    }

    return NextResponse.json(serializedTransaction)
  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// T071: PUT /api/transactions/[id] (update transaction)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    // Check transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: {
        id,
      },
      data: {
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

    // Convert Decimal amount to number for JSON serialization
    const serializedTransaction = {
      ...transaction,
      amount: transaction.amount.toNumber(),
    }

    // T133: Check budget alert after transaction update (for EXPENSE transactions only)
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
        return NextResponse.json({
          transaction: serializedTransaction,
          alert: {
            type: alert.type,
            message: alert.message,
          }
        })
      }
    }

    return NextResponse.json(serializedTransaction)
  } catch (error) {
    console.error('Update transaction error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid transaction data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// T072: DELETE /api/transactions/[id] (delete transaction)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // T133: Check budget alert after transaction delete (for EXPENSE transactions only)
    // Store the categoryId before deleting
    const categoryId = existingTransaction.categoryId
    const transactionDate = existingTransaction.date

    // Delete transaction
    await prisma.transaction.delete({
      where: {
        id,
      },
    })

    // Check if budget status changed after deletion
    if (existingTransaction.type === 'EXPENSE' && categoryId) {
      const { checkBudgetAlert, storeAlert } = await import('@/lib/services/alertService')
      const alert = await checkBudgetAlert(
        session.user.id,
        categoryId,
        transactionDate
      )

      if (alert) {
        storeAlert(session.user.id, alert)

        // Return alert in response so UI can display it
        return NextResponse.json({
          message: 'Transaction deleted successfully',
          alert: {
            type: alert.type,
            message: alert.message,
          }
        })
      }
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
