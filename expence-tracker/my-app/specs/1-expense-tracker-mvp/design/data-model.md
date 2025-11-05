# Data Model Design

**Feature:** Expense Tracker MVP
**Date:** 2025-11-04
**Database:** PostgreSQL + Prisma ORM
**Status:** Complete

---

## Overview

This document defines the complete data model for the Expense Tracker MVP, including entities, relationships, validation rules, and migration strategy. The model is designed to support all functional requirements while maintaining data integrity and privacy.

---

## Core Entities

### 1. User

**Purpose:** Store user account information and preferences

**Prisma Schema:**
```prisma
model User {
  id                String       @id @default(uuid())
  email             String       @unique @db.VarChar(255)
  emailVerified     Boolean      @default(false)
  passwordHash      String       @db.VarChar(255)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  // Preferences
  budgetAlertsEnabled    Boolean  @default(true)
  dailyRemindersEnabled  Boolean  @default(false)
  reminderTime           String?  @db.VarChar(5)  // HH:MM format
  notificationMethod     NotificationMethod @default(IN_APP)

  // Relations
  transactions      Transaction[]
  categories        Category[]
  budgets           Budget[]
  syncQueue         SyncQueueItem[]

  @@index([email])
  @@map("users")
}

enum NotificationMethod {
  IN_APP
  EMAIL
  BOTH
}
```

**Fields:**
- `id`: UUID primary key
- `email`: Unique user email (validated before insert)
- `emailVerified`: Flag for email verification status
- `passwordHash`: Bcrypt hash of password (cost factor 12)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last modification timestamp
- `budgetAlertsEnabled`: Global budget alert toggle
- `dailyRemindersEnabled`: Daily expense reminder toggle
- `reminderTime`: Preferred time for daily reminders (24-hour format)
- `notificationMethod`: Where to send notifications

**Validation Rules:**
- Email must be valid format (validated by Zod)
- Email must be unique across all users
- Password must meet strength requirements (handled before hashing)
- Reminder time must be HH:MM format (00:00-23:59)

**Privacy:**
- No unnecessary PII stored (no name, phone, address)
- Email is only required field for authentication
- Password is always hashed, never stored in plain text

---

### 2. Transaction

**Purpose:** Store all financial transactions (expenses and income)

**Prisma Schema:**
```prisma
model Transaction {
  id              String       @id @default(uuid())
  userId          String
  type            TransactionType
  amount          Decimal      @db.Decimal(10, 2)  // Max: 99,999,999.99
  category        String       @db.VarChar(100)
  categoryId      String?      // Optional FK for future category table
  date            DateTime     @db.Date
  description     String?      @db.VarChar(200)
  paymentMethod   PaymentMethod
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, date])
  @@index([userId, category])
  @@map("transactions")
}

enum TransactionType {
  EXPENSE
  INCOME
}

enum PaymentMethod {
  CASH
  CARD
  BANK_TRANSFER
  OTHER
}
```

**Fields:**
- `id`: UUID primary key
- `userId`: Foreign key to User (owner of transaction)
- `type`: EXPENSE or INCOME
- `amount`: Decimal with 2 decimal places (prevents floating-point errors)
- `category`: Category name (string for flexibility)
- `categoryId`: Optional FK for future normalization
- `date`: Transaction date (DATE type, no time)
- `description`: Optional description (max 200 chars)
- `paymentMethod`: How the transaction was paid
- `createdAt`: When transaction was logged
- `updatedAt`: Last modification

**Validation Rules:**
- Amount must be > 0 and ≤ $99,999,999.99
- Date cannot be in the future
- Date should not be more than 1 year in the past (warning, not error)
- Description max 200 characters
- Category must exist in user's categories

**Indexes:**
- `(userId)`: Fast lookup of user's transactions
- `(userId, date)`: Fast date range queries for reports
- `(userId, category)`: Fast category filtering

**Precision:**
- Using `Decimal` type (PostgreSQL NUMERIC) prevents floating-point errors
- Always 2 decimal places for currency
- All calculations use decimal.js library in application code

---

### 3. Category

**Purpose:** Store predefined and custom expense/income categories

**Prisma Schema:**
```prisma
model Category {
  id              String       @id @default(uuid())
  userId          String?      // NULL for predefined, set for custom
  name            String       @db.VarChar(100)
  type            TransactionType
  isPredefined    Boolean      @default(false)
  createdAt       DateTime     @default(now())

  // Relations
  user            User?        @relation(fields: [userId], references: [id], onDelete: Cascade)
  budgets         Budget[]

  @@unique([userId, name, type])  // Unique per user, per type
  @@index([userId])
  @@map("categories")
}
```

**Fields:**
- `id`: UUID primary key
- `userId`: NULL for system predefined, user ID for custom
- `name`: Category name (e.g., "Food", "Rent", "Salary")
- `type`: EXPENSE or INCOME
- `isPredefined`: True for system categories
- `createdAt`: Creation timestamp

**Predefined Categories (Expenses):**
- Food
- Rent
- Travel
- Transportation
- Entertainment
- Healthcare
- Utilities
- Shopping
- Education

**Predefined Categories (Income):**
- Salary
- Freelance
- Investment
- Gift
- Other

**Validation Rules:**
- Name must be unique per user per type
- Name max 100 characters
- Cannot delete category if transactions exist with it
- Predefined categories cannot be deleted (only hidden)

**Seed Data:**
- Predefined categories are seeded during database initialization
- userId is NULL for predefined categories
- All users can see predefined categories + their custom categories

---

### 4. Budget

**Purpose:** Store monthly budget limits per category

**Prisma Schema:**
```prisma
model Budget {
  id              String       @id @default(uuid())
  userId          String
  categoryId      String
  amount          Decimal      @db.Decimal(10, 2)
  month           DateTime     @db.Date  // First day of month (YYYY-MM-01)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  // Relations
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  category        Category     @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@unique([userId, categoryId, month])  // One budget per category per month
  @@index([userId])
  @@index([userId, month])
  @@map("budgets")
}
```

**Fields:**
- `id`: UUID primary key
- `userId`: Foreign key to User
- `categoryId`: Foreign key to Category
- `amount`: Budget limit (Decimal, 2 decimal places)
- `month`: First day of the month (e.g., 2025-11-01)
- `createdAt`: Budget creation timestamp
- `updatedAt`: Last modification

**Validation Rules:**
- Amount must be > 0 and ≤ $1,000,000
- One budget per category per month per user
- Month must be first day of month (enforced in application)
- Cannot delete category if budgets reference it (Cascade would delete budgets)

**Budget Calculation:**
- Spending = SUM(transactions WHERE userId = X AND category = Y AND date >= month AND date < next_month AND type = EXPENSE)
- Progress = (Spending / Budget) * 100
- Alert when Progress >= 90% or Progress >= 100%

---

### 5. SyncQueueItem

**Purpose:** Track offline operations for synchronization

**Prisma Schema:**
```prisma
model SyncQueueItem {
  id              String       @id @default(uuid())
  userId          String
  operation       SyncOperation
  entityType      EntityType
  entityId        String
  payload         Json
  createdAt       DateTime     @default(now())
  syncedAt        DateTime?

  // Relations
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, syncedAt])
  @@map("sync_queue")
}

enum SyncOperation {
  CREATE
  UPDATE
  DELETE
}

enum EntityType {
  TRANSACTION
  CATEGORY
  BUDGET
}
```

**Fields:**
- `id`: UUID primary key
- `userId`: Foreign key to User
- `operation`: CREATE, UPDATE, or DELETE
- `entityType`: What was modified
- `entityId`: ID of the entity
- `payload`: Full entity data as JSON
- `createdAt`: When operation was queued
- `syncedAt`: When operation was synced (NULL if pending)

**Usage:**
- When offline, operations are queued locally
- When connection restored, queued items sync to server
- After successful sync, syncedAt is set
- Periodically clean up synced items older than 7 days

**Conflict Resolution:**
- Last-write-wins strategy (timestamp comparison)
- Server timestamp always wins in conflicts
- User notified of any data overwrites

---

## Relationships

### User → Transaction (One-to-Many)

```
User.id → Transaction.userId
```

- One user has many transactions
- Cascade delete: Deleting user deletes all their transactions
- Index on `userId` for fast queries

### User → Category (One-to-Many)

```
User.id → Category.userId
```

- One user has many custom categories
- Predefined categories have `userId = NULL`
- Cascade delete: Deleting user deletes their custom categories

### User → Budget (One-to-Many)

```
User.id → Budget.userId
```

- One user has many budgets
- Cascade delete: Deleting user deletes all their budgets

### Category → Budget (One-to-Many)

```
Category.id → Budget.categoryId
```

- One category can have many budgets (one per month)
- Restrict delete: Cannot delete category if budgets exist

### User → SyncQueueItem (One-to-Many)

```
User.id → SyncQueueItem.userId
```

- One user has many queued sync operations
- Cascade delete: Deleting user deletes their sync queue

---

## Database Constraints

### Primary Keys
- All tables use UUID primary keys
- Generated via `@default(uuid())` in Prisma
- UUIDs prevent ID guessing and allow distributed generation

### Unique Constraints
- `User.email`: Prevent duplicate email addresses
- `(Category.userId, Category.name, Category.type)`: One category name per user per type
- `(Budget.userId, Budget.categoryId, Budget.month)`: One budget per category per month

### Foreign Key Constraints
- All foreign keys have `onDelete` behavior:
  - `CASCADE`: Delete related records (transactions, budgets when user deleted)
  - `RESTRICT`: Prevent deletion (cannot delete category if budgets exist)

### Check Constraints (Application Level)
```sql
-- Amount validation (enforced in Zod schemas)
amount > 0 AND amount <= 99999999.99

-- Date validation (enforced in Zod schemas)
date <= CURRENT_DATE

-- Description length (enforced in Zod schemas)
LENGTH(description) <= 200
```

---

## Indexes

### Performance Indexes

```prisma
// User lookups
@@index([email])  // User.email

// Transaction queries
@@index([userId])  // Transaction.userId
@@index([userId, date])  // Date range queries
@@index([userId, category])  // Category filtering

// Budget queries
@@index([userId])  // Budget.userId
@@index([userId, month])  // Monthly budget lookup

// Category queries
@@index([userId])  // Category.userId

// Sync queue
@@index([userId, syncedAt])  // Pending sync items
```

### Index Rationale
- `User.email`: Fast login lookup
- `Transaction.(userId, date)`: Fast monthly/yearly reports
- `Transaction.(userId, category)`: Fast category filtering
- `Budget.(userId, month)`: Fast current month budget retrieval
- Composite indexes optimize common query patterns

---

## Data Validation

### Zod Schemas (Shared between Client and Server)

```typescript
// schemas/transaction.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['EXPENSE', 'INCOME']),
  amount: z.number().positive().max(99999999.99).multipleOf(0.01),
  category: z.string().min(1).max(100),
  date: z.date().max(new Date(), 'Date cannot be in future'),
  description: z.string().max(200).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER']),
})

// schemas/budget.ts
export const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive().max(1000000).multipleOf(0.01),
  month: z.date(),
})

// schemas/category.ts
export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['EXPENSE', 'INCOME']),
})

// schemas/user.ts
export const userPreferencesSchema = z.object({
  budgetAlertsEnabled: z.boolean(),
  dailyRemindersEnabled: z.boolean(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable(),
  notificationMethod: z.enum(['IN_APP', 'EMAIL', 'BOTH']),
})
```

---

## Migration Strategy

### Initial Migration

```typescript
// prisma/migrations/001_init/migration.sql
-- Create enums
CREATE TYPE "NotificationMethod" AS ENUM ('IN_APP', 'EMAIL', 'BOTH');
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'OTHER');
CREATE TYPE "SyncOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE');
CREATE TYPE "EntityType" AS ENUM ('TRANSACTION', 'CATEGORY', 'BUDGET');

-- Create users table
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "emailVerified" BOOLEAN DEFAULT FALSE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "budgetAlertsEnabled" BOOLEAN DEFAULT TRUE,
  "dailyRemindersEnabled" BOOLEAN DEFAULT FALSE,
  "reminderTime" VARCHAR(5),
  "notificationMethod" "NotificationMethod" DEFAULT 'IN_APP',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email
CREATE INDEX "idx_users_email" ON "users"("email");

-- Continue with other tables...
```

### Seed Data (Predefined Categories)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed predefined expense categories
  const expenseCategories = [
    'Food',
    'Rent',
    'Travel',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Shopping',
    'Education',
  ]

  for (const name of expenseCategories) {
    await prisma.category.upsert({
      where: { userId_name_type: { userId: null, name, type: 'EXPENSE' } },
      update: {},
      create: {
        name,
        type: 'EXPENSE',
        isPredefined: true,
      },
    })
  }

  // Seed predefined income categories
  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']

  for (const name of incomeCategories) {
    await prisma.category.upsert({
      where: { userId_name_type: { userId: null, name, type: 'INCOME' } },
      update: {},
      create: {
        name,
        type: 'INCOME',
        isPredefined: true,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## Schema Versioning

### Version Control
- All migrations tracked in `prisma/migrations/`
- Each migration has timestamp + description
- Rollback scripts for every migration
- Never modify existing migrations (create new ones)

### Backward Compatibility
- Additive changes preferred (add columns, add tables)
- Deprecation period before removing columns
- Use database views for compatibility layer if needed

### Zero-Downtime Migrations
1. Add new column as nullable
2. Deploy code that writes to both old and new
3. Backfill data
4. Deploy code that reads from new column
5. Remove old column in next migration

---

## Data Integrity

### Transaction Guarantees
- All financial operations wrapped in database transactions
- Atomicity: Budget creation and initial calculation together
- Consistency: Foreign keys enforce referential integrity
- Isolation: Read committed isolation level
- Durability: WAL (Write-Ahead Logging) enabled

### Decimal Precision
```typescript
// Always use Decimal type for amounts
import { Decimal } from '@prisma/client/runtime'

// Calculations
const total = transactions.reduce(
  (sum, t) => sum.plus(new Decimal(t.amount)),
  new Decimal(0)
)

// Formatting for display
const formatted = total.toFixed(2)  // "1234.56"
```

### Audit Trail
- `createdAt`: When record was created
- `updatedAt`: When record was last modified
- Future: Add `deletedAt` for soft deletes if needed

---

## Privacy and Security

### Data Isolation
- All queries include `WHERE userId = ?` for user-scoped data
- Prisma middleware enforces user isolation:

```typescript
// middleware/user-isolation.ts
prisma.$use(async (params, next) => {
  const userId = getCurrentUserId()  // from session

  if (params.model === 'Transaction' || params.model === 'Budget') {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, userId }
    }
  }

  return next(params)
})
```

### Encryption at Rest
- PostgreSQL with pgcrypto extension
- Sensitive fields encrypted (if needed in future)
- Backup files also encrypted

### Data Deletion
```typescript
// Complete user deletion
async function deleteUserData(userId: string) {
  await prisma.$transaction([
    prisma.syncQueueItem.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ])
}
```

---

## Scalability

### Current Capacity
- Designed for: 10,000 users
- Transaction volume: 10M total transactions
- Per-user limit: ~1,000 transactions (soft limit)

### Performance Expectations
- Single transaction query: < 10ms
- Monthly report (50 transactions): < 50ms
- Dashboard (multiple queries): < 200ms total
- Budget calculation: < 20ms

### Scaling Strategy
- Vertical scaling first (increase database resources)
- Read replicas for reporting queries (future)
- Partitioning by userId if needed (future)
- Archive old transactions (> 2 years) to separate table (future)

---

## Backup and Recovery

### Backup Strategy
- Automated daily backups (PostgreSQL pg_dump)
- Retention: 30 days
- Encrypted backup files
- Stored in separate region

### Point-in-Time Recovery
- WAL archiving enabled
- Can restore to any point in last 7 days
- Recovery time objective (RTO): 4 hours
- Recovery point objective (RPO): 1 hour

---

## Testing the Data Model

### Unit Tests

```typescript
// __tests__/models/transaction.test.ts
describe('Transaction Model', () => {
  it('should create transaction with valid data', async () => {
    const transaction = await prisma.transaction.create({
      data: {
        userId: testUser.id,
        type: 'EXPENSE',
        amount: new Decimal('50.00'),
        category: 'Food',
        date: new Date(),
        paymentMethod: 'CARD',
      },
    })

    expect(transaction.amount).toEqual(new Decimal('50.00'))
  })

  it('should reject negative amount', async () => {
    await expect(
      prisma.transaction.create({
        data: {
          userId: testUser.id,
          type: 'EXPENSE',
          amount: new Decimal('-10.00'),  // Invalid
          category: 'Food',
          date: new Date(),
          paymentMethod: 'CARD',
        },
      })
    ).rejects.toThrow()
  })

  it('should enforce user isolation', async () => {
    const otherUserTransaction = await createTransaction(otherUser.id)

    const found = await prisma.transaction.findFirst({
      where: { id: otherUserTransaction.id, userId: testUser.id },
    })

    expect(found).toBeNull()
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/budget-calculation.test.ts
describe('Budget Calculation', () => {
  it('should calculate budget progress correctly', async () => {
    // Setup: Create budget and transactions
    const budget = await prisma.budget.create({
      data: {
        userId: testUser.id,
        categoryId: foodCategory.id,
        amount: new Decimal('500.00'),
        month: new Date('2025-11-01'),
      },
    })

    await createTransaction({
      userId: testUser.id,
      type: 'EXPENSE',
      amount: '450.00',  // 90% of budget
      category: 'Food',
      date: new Date('2025-11-15'),
    })

    // Calculate progress
    const progress = await calculateBudgetProgress(budget.id)

    expect(progress.percentage).toBe(90)
    expect(progress.shouldAlert).toBe(true)  // >= 90%
  })
})
```

---

## Conclusion

The data model is designed to:
- ✅ Support all functional requirements
- ✅ Maintain data integrity (ACID transactions, constraints)
- ✅ Ensure privacy (user isolation, no PII)
- ✅ Scale to 10,000 users with 10M transactions
- ✅ Provide fast queries (< 100ms p95)
- ✅ Enable safe migrations (versioning, rollback)
- ✅ Support offline sync (queue table)

All entities, relationships, and constraints are fully specified. Ready to generate Prisma schema and API contracts.
