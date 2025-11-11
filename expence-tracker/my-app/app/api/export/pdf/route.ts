import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Decimal } from 'decimal.js'

// Query schema
const exportQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

// T163: GET /api/export/pdf - Export summary report to PDF
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const queryParams = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }

    const validated = exportQuerySchema.safeParse(queryParams)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      )
    }

    // Default to current month if no dates provided
    const now = new Date()
    const startDate = validated.data.startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = validated.data.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
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

    // T164: Calculate summary statistics
    let totalExpenses = new Decimal(0)
    let totalIncome = new Decimal(0)
    const categoryMap = new Map<string, Decimal>()

    transactions.forEach((tx) => {
      const amount = new Decimal(tx.amount.toString())
      if (tx.type === 'EXPENSE') {
        totalExpenses = totalExpenses.plus(amount)

        // Aggregate by category for top categories
        if (categoryMap.has(tx.category)) {
          categoryMap.set(tx.category, categoryMap.get(tx.category)!.plus(amount))
        } else {
          categoryMap.set(tx.category, amount)
        }
      } else if (tx.type === 'INCOME') {
        totalIncome = totalIncome.plus(amount)
      }
    })

    const netBalance = totalIncome.minus(totalExpenses)

    // Top 5 categories
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1].comparedTo(a[1]))
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount: amount.toNumber(),
        percentage: totalExpenses.isZero() ? 0 : amount.dividedBy(totalExpenses).times(100).toNumber(),
      }))

    // T167: Create PDF with A4 size
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    })

    // Add header
    doc.setFontSize(20)
    doc.text('Expense Tracker Report', 105, 20, { align: 'center' })

    // Add date range
    doc.setFontSize(10)
    doc.setTextColor(100)
    const dateRangeText = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    doc.text(dateRangeText, 105, 28, { align: 'center' })

    // T164: Add summary statistics
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('Summary', 20, 40)

    doc.setFontSize(10)
    const summaryY = 48
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, summaryY)
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 20, summaryY + 6)
    doc.text(`Net Balance: $${netBalance.toFixed(2)}`, 20, summaryY + 12)
    doc.text(`Total Transactions: ${transactions.length}`, 20, summaryY + 18)

    // Add top categories section
    if (topCategories.length > 0) {
      doc.setFontSize(14)
      doc.text('Top Spending Categories', 20, summaryY + 30)

      const categoriesData = topCategories.map((cat) => [
        cat.category,
        `$${cat.amount.toFixed(2)}`,
        `${cat.percentage.toFixed(1)}%`,
      ])

      autoTable(doc, {
        startY: summaryY + 35,
        head: [['Category', 'Amount', 'Percentage']],
        body: categoriesData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      })
    }

    // T166: Add transaction table
    const transactionsStartY = (doc as any).lastAutoTable?.finalY || summaryY + 80

    doc.setFontSize(14)
    doc.text('Transactions', 20, transactionsStartY + 10)

    // Limit transactions to fit in PDF (T168: keep file size < 5MB)
    const maxTransactions = 100
    const displayTransactions = transactions.slice(0, maxTransactions)

    const transactionsData = displayTransactions.map((tx) => [
      tx.date.toLocaleDateString(),
      tx.type,
      tx.category,
      `$${tx.amount.toFixed(2)}`,
      tx.description || '-',
      tx.paymentMethod,
    ])

    autoTable(doc, {
      startY: transactionsStartY + 15,
      head: [['Date', 'Type', 'Category', 'Amount', 'Description', 'Payment']],
      body: transactionsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 40 }, // Description column
      },
    })

    if (transactions.length > maxTransactions) {
      const finalY = (doc as any).lastAutoTable?.finalY || transactionsStartY + 100
      doc.setFontSize(8)
      doc.setTextColor(100)
      doc.text(
        `* Showing first ${maxTransactions} of ${transactions.length} transactions`,
        20,
        finalY + 10
      )
    }

    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(100)
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        105,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      )
    }

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Set filename with date range
    const filename = `expense_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`

    // Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF report' },
      { status: 500 }
    )
  }
}
