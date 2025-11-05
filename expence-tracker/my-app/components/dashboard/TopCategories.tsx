'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Category {
  name: string
  amount: number
  count: number
  percentage: number
}

interface TopCategoriesProps {
  categories: Category[]
}

export function TopCategories({ categories }: TopCategoriesProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>Your highest spending categories</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No expense data available for this period
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
        <CardDescription>Your highest spending categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    {category.count} {category.count === 1 ? 'tx' : 'txs'}
                  </span>
                  <span className="font-semibold">
                    ${category.amount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={category.percentage}
                  className="h-2 flex-1"
                  indicatorClassName="bg-blue-500"
                />
                <span className="text-xs text-muted-foreground min-w-[45px] text-right">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
