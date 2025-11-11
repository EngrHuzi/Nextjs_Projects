'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download } from 'lucide-react'

interface Transaction {
  id: string
  type: 'EXPENSE' | 'INCOME'
  amount: number
  category: string
  date: Date | string
  description: string | null
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER'
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }

      if (categoryFilter) {
        params.append('category', categoryFilter)
      }

      if (paymentMethodFilter !== 'all') {
        params.append('paymentMethod', paymentMethodFilter)
      }

      const response = await fetch(`/api/transactions?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions')
      }

      setTransactions(data.transactions)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Fetch transactions error:', error)
      toast.error('Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, typeFilter, categoryFilter, paymentMethodFilter])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        const filtered = transactions.filter((t) =>
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        // For now, just filter client-side; can be moved to API later
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, transactions])

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setIsFormOpen(true)
  }

  // T161: CSV Export handler
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams()

      // Add same filters as current view
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      if (categoryFilter) {
        params.append('category', categoryFilter)
      }

      // Trigger download
      const response = await fetch(`/api/export/csv?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to export CSV')
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Transactions exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export transactions')
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return

    try {
      const response = await fetch(`/api/transactions/${deletingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete transaction')
      }

      toast.success('Transaction deleted successfully')
      setIsDeleteDialogOpen(false)
      setDeletingId(null)
      fetchTransactions()
    } catch (error) {
      console.error('Delete transaction error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete transaction')
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingTransaction(null)
    fetchTransactions()
  }

  const filteredTransactions = searchQuery
    ? transactions.filter((t) =>
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Track your income and expenses
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-2 block">Type</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="EXPENSE">Expenses</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-2 block">Payment Method</label>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CARD">Card</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handleAddTransaction}>
              Add Transaction
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      ) : (
        <>
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteClick}
          />

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Transaction Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? 'Update the transaction details below.'
                : 'Enter the transaction details below.'}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
