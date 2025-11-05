'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PreviewData {
  date: string
  type: string
  amount: number
  category: string
  description?: string
  paymentMethod: string
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewData[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [errors, setErrors] = useState<Array<{ row: number; error: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  // T171: Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setPreview([])
      setErrors([])
      setImportResult(null)
    } else {
      toast.error('Please select a CSV file')
    }
  }

  // T177: Show preview of parsed transactions
  const handlePreview = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('preview', 'true')

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to preview CSV')
      }

      setPreview(data.preview || [])
      setTotalRows(data.totalRows || 0)
      setErrors(data.errors || [])
      toast.success('Preview loaded successfully')
    } catch (error) {
      console.error('Preview error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to preview CSV')
    } finally {
      setIsLoading(false)
    }
  }

  // T179: Confirm and execute import
  const handleImport = async () => {
    if (!file) return

    if (!confirm(`Import ${totalRows} transactions? This cannot be undone.`)) {
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import transactions')
      }

      setImportResult(data)
      setFile(null)
      setPreview([])
      toast.success(`Successfully imported ${data.imported} transactions`)
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to import transactions')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Import Transactions</h1>
        <p className="text-muted-foreground mt-2">
          Upload a CSV file to import your transactions
        </p>
      </div>

      {/* T181: Import result summary */}
      {importResult && (
        <Alert className="mb-6 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Import Successful</AlertTitle>
          <AlertDescription>
            Imported {importResult.imported} of {importResult.total} transactions.
            {importResult.errors > 0 && ` ${importResult.errors} rows had errors.`}
            {importResult.duplicates > 0 && ` ${importResult.duplicates} possible duplicates detected.`}
          </AlertDescription>
        </Alert>
      )}

      {/* T170-T171: File upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            CSV must include: Date, Type, Amount, Category. Optional: Description, Payment Method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handlePreview}
              disabled={!file || isLoading}
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* T178: Error display */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors ({errors.length})</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2">
              {errors.slice(0, 5).map((err, idx) => (
                <li key={idx}>Row {err.row}: {err.error}</li>
              ))}
              {errors.length > 5 && <li>... and {errors.length - 5} more errors</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* T177: Preview table */}
      {preview.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Showing first 10 of {totalRows} transactions
              </CardDescription>
            </div>
            <Button
              onClick={handleImport}
              disabled={isLoading || errors.length > 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import {totalRows} Transactions
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((tx, idx) => (
                    <tr key={idx} className="border-b hover:bg-accent">
                      <td className="p-2">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="p-2">{tx.type}</td>
                      <td className="p-2">${tx.amount.toFixed(2)}</td>
                      <td className="p-2">{tx.category}</td>
                      <td className="p-2">{tx.description || '-'}</td>
                      <td className="p-2">{tx.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Format Help */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Required columns:</strong></p>
            <ul className="list-disc pl-6">
              <li>Date (YYYY-MM-DD format)</li>
              <li>Type (EXPENSE or INCOME)</li>
              <li>Amount (positive number)</li>
              <li>Category (text)</li>
            </ul>
            <p className="mt-4"><strong>Optional columns:</strong></p>
            <ul className="list-disc pl-6">
              <li>Description (text)</li>
              <li>Payment Method (CASH, CARD, BANK_TRANSFER, or OTHER)</li>
            </ul>
            <p className="mt-4 text-muted-foreground">
              Column names are case-insensitive. The system will detect and warn about potential duplicates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
