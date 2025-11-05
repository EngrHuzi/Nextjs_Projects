# Implementation Quickstart Guide

**Feature:** Expense Tracker MVP
**Stack:** Next.js 16 + TypeScript + PostgreSQL + Prisma
**Date:** 2025-11-04

---

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (local or cloud)
- Git initialized
- Code editor (VS Code recommended)

---

## Phase 1: Project Foundation (Week 1-2)

### Step 1: Initialize Next.js Project

```bash
# Already initialized - verify setup
npm install

# Install core dependencies
npm install @prisma/client bcryptjs zod react-hook-form @hookform/resolvers
npm install next-auth@beta resend decimal.js

# Install dev dependencies
npm install -D prisma @types/bcryptjs eslint-config-prettier prettier
```

### Step 2: Configure Prisma

```bash
# Initialize Prisma
npx prisma init

# This creates:
# - prisma/schema.prisma
# - .env file
```

**Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Copy schema from design/data-model.md
```

**Update `.env`:**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
RESEND_API_KEY="your-resend-api-key"
```

### Step 3: Run Initial Migration

```bash
# Create and run migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed predefined categories
npx prisma db seed
```

### Step 4: Install shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# When prompted, select:
# - Style: Default
# - Color: Slate
# - CSS variables: Yes

# Install core components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add toast
npx shadcn@latest add dropdown-menu
```

### Step 5: Setup NextAuth.js

**Create `lib/auth.ts`:**

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.emailVerified) {
          return null
        }

        const isValid = await compare(credentials.password, user.passwordHash)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
```

**Create `app/api/auth/[...nextauth]/route.ts`:**

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### Step 6: Create Prisma Client Singleton

**Create `lib/prisma.ts`:**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Step 7: Setup Folder Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard
│   ├── transactions/
│   │   └── page.tsx
│   ├── budgets/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── api/
│   ├── auth/
│   ├── transactions/
│   ├── categories/
│   └── budgets/
├── layout.tsx
└── page.tsx                  # Landing page

components/
├── ui/                       # shadcn components
├── forms/
│   ├── transaction-form.tsx
│   └── budget-form.tsx
├── dashboard/
│   ├── expense-chart.tsx
│   └── budget-card.tsx
└── layout/
    ├── header.tsx
    └── sidebar.tsx

lib/
├── auth.ts
├── prisma.ts
├── utils.ts
└── validations/
    ├── transaction.ts
    ├── budget.ts
    └── category.ts
```

---

## Phase 2: Expense CRUD (Week 3-4)

### Step 1: Create Validation Schemas

**`lib/validations/transaction.ts`:**

```typescript
import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  amount: z.number().positive().max(99999999.99).multipleOf(0.01),
  category: z.string().min(1).max(100),
  date: z.date().max(new Date(), 'Date cannot be in future'),
  description: z.string().max(200).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER']),
})

export type TransactionInput = z.infer<typeof transactionSchema>
```

### Step 2: Create API Route

**`app/api/transactions/route.ts`:**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validations/transaction'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const type = searchParams.get('type')
  const category = searchParams.get('category')

  const where = {
    userId: session.user.id,
    ...(type && { type }),
    ...(category && { category }),
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return NextResponse.json({
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const validation = transactionSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error },
      { status: 400 }
    )
  }

  const transaction = await prisma.transaction.create({
    data: {
      ...validation.data,
      userId: session.user.id,
    },
  })

  return NextResponse.json(transaction, { status: 201 })
}
```

### Step 3: Create Transaction Form Component

**`components/forms/transaction-form.tsx`:**

```typescript
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { transactionSchema, type TransactionInput } from '@/lib/validations/transaction'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date(),
      paymentMethod: 'CARD',
    },
  })

  async function onSubmit(data: TransactionInput) {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      form.reset()
      onSuccess?.()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add other form fields */}

        <Button type="submit">Save Transaction</Button>
      </form>
    </Form>
  )
}
```

### Step 4: Create Transaction List Page

**`app/(dashboard)/transactions/page.tsx`:**

```typescript
import { TransactionForm } from '@/components/forms/transaction-form'
import { TransactionList } from '@/components/transactions/transaction-list'

export default function TransactionsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <TransactionForm />
        </div>

        <div className="md:col-span-2">
          <TransactionList />
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 3: Dashboard & Charts (Week 5-6)

### Step 1: Install Recharts

```bash
npm install recharts
```

### Step 2: Create Dashboard Summary API

**`app/api/reports/summary/route.ts`:**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = new Date(searchParams.get('startDate') || new Date().toISOString())
  const endDate = new Date(searchParams.get('endDate') || new Date().toISOString())

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expensesByCategory = Object.entries(
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount)
        return acc
      }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / totalExpenses) * 100,
  }))

  return NextResponse.json({
    totalExpenses,
    totalIncome,
    netBalance: totalIncome - totalExpenses,
    expensesByCategory,
  })
}
```

### Step 3: Create Expense Chart Component

**`components/dashboard/expense-chart.tsx`:**

```typescript
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ExpenseChart({ data }: { data: Array<{ category: string; amount: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.category}: $${entry.amount.toFixed(2)}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

---

## Phase 4: Data Portability (Week 7-8)

### CSV Export API

**`app/api/export/csv/route.ts`:**

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { startDate, endDate } = await req.json()

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: { date: 'desc' },
  })

  const csv = [
    ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Description'].join(','),
    ...transactions.map((t) =>
      [
        t.date.toISOString().split('T')[0],
        t.type,
        t.category,
        t.amount.toString(),
        t.paymentMethod,
        t.description || '',
      ].join(',')
    ),
  ].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
```

---

## Phase 5: AI Categorization (Week 9-10)

### Install TensorFlow.js

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node
```

### Simple Keyword-Based Categorization (MVP Approach)

**`lib/ai/categorize.ts`:**

```typescript
const CATEGORY_KEYWORDS = {
  Food: ['restaurant', 'grocery', 'food', 'cafe', 'lunch', 'dinner', 'breakfast'],
  Transportation: ['uber', 'lyft', 'gas', 'fuel', 'parking', 'metro', 'bus'],
  Entertainment: ['movie', 'concert', 'game', 'spotify', 'netflix'],
  Shopping: ['amazon', 'store', 'mall', 'shop'],
  Healthcare: ['doctor', 'pharmacy', 'hospital', 'medicine'],
}

export function suggestCategory(description: string): string | null {
  const lowerDesc = description.toLowerCase()

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
      return category
    }
  }

  return null
}
```

---

## Phase 6: Testing & Launch (Week 11-12)

### Install Testing Libraries

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install -D playwright @playwright/test
```

### Create Jest Config

**`jest.config.js`:**

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npx playwright test

# Coverage
npm test -- --coverage
```

---

## Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - RESEND_API_KEY
```

---

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Run production
npm start

# Lint
npm run lint

# Format
npx prettier --write .

# Prisma Studio (GUI for database)
npx prisma studio

# Database migrations
npx prisma migrate dev

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

---

## Troubleshooting

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npx prisma generate
```

### Database Connection Issues

```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running
# Test connection with psql
```

### Next.js Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## Next Steps

1. Review `design/research.md` for architecture decisions
2. Review `design/data-model.md` for database schema
3. Review `contracts/openapi.yaml` for API specifications
4. Follow phase-by-phase implementation
5. Write tests as you go (aim for 80% coverage)
6. Deploy early, deploy often

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Recharts Docs](https://recharts.org)
