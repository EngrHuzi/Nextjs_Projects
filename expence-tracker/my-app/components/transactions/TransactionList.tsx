'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/decimal'
import { formatDateShort } from '@/lib/utils/date'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Transaction {
  id: string
  type: 'EXPENSE' | 'INCOME'
  amount: number
  category: string
  date: Date | string
  description: string | null
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER'
}

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No transactions found.</p>
        <p className="text-muted-foreground text-sm mt-2">
          Click "Add Transaction" to create your first transaction.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {formatDateShort(transaction.date)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={transaction.type === 'EXPENSE' ? 'destructive' : 'default'}
                >
                  {transaction.type === 'EXPENSE' ? 'Expense' : 'Income'}
                </Badge>
              </TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {transaction.description || '—'}
              </TableCell>
              <TableCell>
                {transaction.paymentMethod === 'BANK_TRANSFER'
                  ? 'Bank Transfer'
                  : transaction.paymentMethod.charAt(0) +
                    transaction.paymentMethod.slice(1).toLowerCase()}
              </TableCell>
              <TableCell
                className={`text-right font-semibold ${
                  transaction.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {transaction.type === 'EXPENSE' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
