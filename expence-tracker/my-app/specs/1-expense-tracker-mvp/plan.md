# Implementation Plan: Expense Tracker MVP

**Status:** approved
**Version:** 1.0.0
**Created:** 2025-11-04
**Last Updated:** 2025-11-04
**Architect:** Product Team

---

## Constitution Check

This plan MUST align with constitution principles:

- [x] **Specifications Are Source Code** - Plan is versioned, all artifacts in Git, testable
- [x] **Validation Before Deployment** - Comprehensive testing strategy with 80% coverage target
- [x] **AI as Co-Reasoning Partner** - AI categorization respects privacy, runs locally, user control
- [x] **Privacy by Design** - Zero third-party data sharing, encryption, user data ownership
- [x] **Transparency and Auditability** - All logic traceable, audit logs, clear error handling
- [x] **Simplicity Over Feature Creep** - MVP focused, clear scope boundaries, smallest viable change
- [x] **Automation with Human Oversight** - AI suggestions require user confirmation, user retains control
- [x] **Security Is a Feature** - Authentication best practices, encryption, rate limiting, OWASP compliance
- [x] **Continuous Learning** - PHRs for all sessions, metrics tracking, reflection points

---

## Scope and Dependencies

### In Scope

- **User Management**: Secure registration, authentication, email verification, password reset
- **Expense & Income Tracking**: Manual entry, edit, delete, categorization, payment methods
- **Categorization System**: Predefined categories + custom categories + AI suggestions
- **Budgeting**: Monthly budget creation, progress tracking, 90% threshold alerts
- **Reporting & Visualization**: Dashboard, charts (pie, bar, line), date range filtering
- **Data Management**: CSV/PDF export, CSV import, cloud sync, offline access
- **Notifications**: Optional budget alerts and daily reminders (user-configurable)

### Out of Scope

- Direct bank integration or real-time transaction import
- Multi-currency support (USD only for MVP)
- Tax filing features
- Investment tracking
- Receipt scanning/OCR
- Mobile native apps (web responsive only)
- Collaborative/team features
- Bill payment capabilities

### External Dependencies

| System/Service | Ownership | Integration Point | Status |
|----------------|-----------|-------------------|--------|
| PostgreSQL Database | Infrastructure | Prisma ORM | Ready (Supabase free tier) |
| Email Service (Resend) | Infrastructure | REST API | Ready (3,000 emails/month free) |
| Hosting (Vercel) | Infrastructure | Git push deployment | Ready (free tier) |
| TensorFlow.js | Client-side | Browser runtime | Ready (CDN) |

---

## Key Decisions and Rationale

### Decision 1: Next.js 16 (App Router) as Full-Stack Framework

**Options Considered:**
1. **Next.js 16 with App Router**
   - Pros: Server Components, built-in API routes, file-based routing, excellent TypeScript support, Vercel integration
   - Cons: Newer API (App Router learning curve)
2. **React SPA + Express Backend**
   - Pros: More flexibility, familiar separation
   - Cons: Two codebases, more complex deployment, higher hosting costs
3. **Remix**
   - Pros: Modern routing, excellent data loading
   - Cons: Newer framework, smaller ecosystem

**Trade-offs:**
- Simplicity vs. flexibility: App Router reduces complexity but requires learning new patterns
- Performance vs. familiarity: Server Components improve performance but require different mental model

**Chosen:** Next.js 16 (App Router)

**Rationale:**
- Already installed in project
- Server Components reduce client-side JavaScript (< 2s dashboard load requirement)
- Built-in API routes eliminate need for separate backend
- File-based routing simplifies project structure
- Vercel deployment is one-click with excellent free tier
- Large community and excellent documentation reduce risk

**Principles Applied:**
- **Simplicity**: Single codebase, file-based routing
- **Performance**: Server Components meet < 2s requirement
- **Reversibility**: Can migrate to separate backend if needed

**ADR Required:** No (standard framework choice for React apps)

---

### Decision 2: shadcn/ui + Tailwind CSS for UI

**Options Considered:**
1. **shadcn/ui + Tailwind CSS**
   - Pros: Copy-paste philosophy (full control), Radix UI accessibility, no runtime overhead, customizable
   - Cons: Need to copy components manually
2. **Material-UI (MUI)**
   - Pros: Comprehensive library, mature
   - Cons: 300KB+ bundle size, opinionated design
3. **Chakra UI**
   - Pros: Good accessibility, theme system
   - Cons: Runtime CSS-in-JS overhead

**Trade-offs:**
- Bundle size vs. convenience: shadcn requires manual copy but stays lightweight
- Customization vs. consistency: Full control means more effort to maintain design system

**Chosen:** shadcn/ui + Tailwind CSS

**Rationale:**
- Components live in our codebase (full control, no black box)
- Radix UI primitives ensure WCAG 2.1 AA compliance (NFR-8)
- Tailwind purges unused CSS (small bundle, fast loads)
- No runtime CSS-in-JS overhead (performance)
- Dark mode support built-in

**Principles Applied:**
- **Accessibility**: Radix UI ensures compliance
- **Performance**: No runtime overhead, small bundle
- **Maintainability**: Full control over components

**ADR Required:** No (UI library choice)

---

### Decision 3: PostgreSQL + Prisma ORM for Data Layer

**Options Considered:**
1. **PostgreSQL + Prisma**
   - Pros: ACID transactions, NUMERIC type (no floating-point errors), schema versioning, type safety
   - Cons: More complex than SQLite
2. **MongoDB + Mongoose**
   - Pros: Flexible schema, easy to start
   - Cons: No ACID transactions (pre-v4), decimal handling issues
3. **SQLite**
   - Pros: Zero-config, lightweight
   - Cons: No multi-user concurrency, challenging cloud deployment

**Trade-offs:**
- Consistency vs. flexibility: PostgreSQL enforces schema, MongoDB is flexible
- Setup complexity vs. scalability: SQLite is simpler but doesn't scale to 10,000 users

**Chosen:** PostgreSQL + Prisma ORM

**Rationale:**
- **Financial data requires ACID transactions** (prevent data corruption)
- NUMERIC type ensures decimal precision (no $0.01 rounding errors)
- Prisma generates TypeScript types from schema (type safety)
- Schema versioning with migrations (safe deployments)
- Free tier hosting (Supabase: 500MB database, sufficient for MVP)
- Supports 10,000 users and 10M transactions (scalability target)

**Principles Applied:**
- **Data Integrity**: ACID transactions prevent corruption
- **Transparency**: Schema as code is version-controlled
- **Privacy**: Row-level security possible

**ADR Required:** Yes - **ADR-001: Database Technology and Decimal Precision Strategy**

---

### Decision 4: NextAuth.js v5 for Authentication

**Options Considered:**
1. **NextAuth.js v5 (Auth.js)**
   - Pros: Built for Next.js, credentials provider, CSRF protection, JWT/database sessions
   - Cons: None significant
2. **Clerk**
   - Pros: Beautiful UI, managed service
   - Cons: Third-party data hosting (privacy violation), costs money
3. **Custom JWT Implementation**
   - Pros: Full control
   - Cons: Security risks, need to handle edge cases

**Trade-offs:**
- Convenience vs. privacy: Clerk is easier but violates privacy-by-design
- Control vs. security best practices: Custom auth is flexible but error-prone

**Chosen:** NextAuth.js v5

**Rationale:**
- Self-hosted (no third-party data sharing)
- Built-in CSRF protection and secure session management
- Bcrypt password hashing with cost factor 12
- Easy to add OAuth providers later (extensibility)
- Large community, actively maintained
- Free and open-source (MIT license)

**Principles Applied:**
- **Privacy**: Self-hosted, no third-party dependencies
- **Security**: Proven security patterns out of the box
- **Simplicity**: Reduces custom auth code

**ADR Required:** No (standard auth choice for Next.js)

---

### Decision 5: TensorFlow.js for Privacy-Preserving AI Categorization

**Options Considered:**
1. **TensorFlow.js (client-side model)**
   - Pros: Runs in browser, zero external API calls, free, privacy-preserving
   - Cons: Lower accuracy than cloud models, model size constraints (< 10MB)
2. **OpenAI API**
   - Pros: Very accurate, easy to use
   - Cons: Sends data to OpenAI, privacy violation, expensive
3. **Simple keyword matching**
   - Pros: Transparent, no ML overhead
   - Cons: Lower accuracy, requires manual rules

**Trade-offs:**
- Accuracy vs. privacy: Cloud AI is more accurate but violates privacy
- Simplicity vs. intelligence: Keyword matching is simple but less helpful

**Chosen:** TensorFlow.js with keyword fallback

**Rationale:**
- **Privacy-by-design**: Model runs entirely in browser, no data sent to servers
- Zero external dependencies (no third-party AI services)
- Works offline (supports offline-first requirement)
- Free (no API costs)
- Transparent (model behavior is auditable)
- User control (easy to disable or override)
- Fallback to keyword matching if model unavailable

**Implementation:**
- Start with keyword matching (Phase 2-4)
- Train small text classification model on user's data (Phase 5)
- Model size: < 10MB (fits in browser cache)
- Accuracy target: 70% after 50 transactions
- Bag-of-words encoding + 2-3 layer neural network

**Principles Applied:**
- **Privacy**: Zero data sent to external services (absolute requirement)
- **Transparency**: Model behavior is inspectable
- **User Control**: Suggestions are optional
- **Simplicity**: Fallback to keyword matching

**ADR Required:** Yes - **ADR-002: Privacy-Preserving AI Categorization Strategy**

---

### Decision 6: Vercel for Hosting and Deployment

**Options Considered:**
1. **Vercel**
   - Pros: Built for Next.js, free tier (100GB bandwidth), automatic CI/CD, edge functions
   - Cons: Vendor lock-in (mitigated by Docker export option)
2. **AWS (Amplify or EC2)**
   - Pros: Extremely scalable, many services
   - Cons: Complex, expensive, steep learning curve
3. **Railway**
   - Pros: Simple, includes database
   - Cons: $5/month minimum, no free tier

**Trade-offs:**
- Cost vs. features: Vercel free tier is generous but has limits
- Simplicity vs. control: Vercel is easier but AWS offers more control

**Chosen:** Vercel

**Rationale:**
- Free tier covers MVP needs (100GB bandwidth, unlimited requests)
- One-click deployment from Git (CI/CD built-in)
- Preview deployments for every PR (testing)
- Global CDN (fast response times worldwide)
- Built by Next.js team (best integration)
- Estimated costs: $0/month for MVP (100 users)

**Scaling Path:**
- 100-1,000 users: Free tier
- 1,000-5,000 users: Pro tier ($20/month) + Supabase Pro ($25/month) = $45/month
- Always under $100/month budget

**Principles Applied:**
- **Simplicity**: One-click deployment, minimal configuration
- **Cost**: Free for MVP, predictable scaling costs
- **Reliability**: 99.9% uptime SLA

**ADR Required:** No (hosting choice)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────┐    │
│  │  Next.js   │  │  React     │  │  TensorFlow.js    │    │
│  │  Pages     │  │ Components │  │  (AI Model)       │    │
│  │ (Server)   │  │ (Client)   │  │                   │    │
│  └─────┬──────┘  └─────┬──────┘  └─────────┬─────────┘    │
│        │               │                   │               │
│        │               │                   │               │
│        └───────────────┴───────────────────┘               │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
                         │ HTTPS (TLS 1.3)
                         │
┌────────────────────────┼────────────────────────────────────┐
│                        │     Vercel Edge Network             │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │       Next.js App Router                │                │
│  │                                          │                │
│  │  ┌──────────┐  ┌─────────────────────┐  │                │
│  │  │  Pages   │  │    API Routes       │  │                │
│  │  │ (SSR/SSG)│  │  /api/auth/*        │  │                │
│  │  │          │  │  /api/transactions  │  │                │
│  │  └────┬─────┘  │  /api/budgets       │  │                │
│  │       │        │  /api/export        │  │                │
│  │       │        └──────────┬──────────┘  │                │
│  │       │                   │             │                │
│  │       └───────────────────┘             │                │
│  │                   │                     │                │
│  │                   ▼                     │                │
│  │       ┌───────────────────────┐         │                │
│  │       │   Server Actions      │         │                │
│  │       │ (Form mutations)      │         │                │
│  │       └───────────┬───────────┘         │                │
│  │                   │                     │                │
│  │                   ▼                     │                │
│  │         ┌─────────────────┐             │                │
│  │         │  Prisma Client  │             │                │
│  │         │  (Type-safe ORM)│             │                │
│  │         └─────────┬───────┘             │                │
│  └───────────────────┼─────────────────────┘                │
│                      │                                      │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       │ PostgreSQL Protocol
                       │
                       ▼
         ┌─────────────────────────────┐
         │    PostgreSQL Database      │
         │      (Supabase)             │
         │                             │
         │  ┌──────────────────────┐   │
         │  │ Tables:              │   │
         │  │ - users              │   │
         │  │ - transactions       │   │
         │  │ - categories         │   │
         │  │ - budgets            │   │
         │  │ - sync_queue         │   │
         │  └──────────────────────┘   │
         └─────────────────────────────┘
                       ▲
                       │
         ┌─────────────┴─────────────┐
         │   Email Service (Resend)  │
         │ - Registration emails     │
         │ - Password reset          │
         │ - Budget alerts           │
         └───────────────────────────┘
```

### Component Responsibilities

**Component A: Next.js Pages (Server Components)**
- Responsibility: Server-side rendering, initial data fetching, SEO
- Technology: Next.js App Router, React Server Components
- Interfaces:
  - Inputs: HTTP requests, route parameters
  - Outputs: Rendered HTML, hydration data

**Component B: API Routes**
- Responsibility: RESTful endpoints for client-side data operations
- Technology: Next.js API Routes, Zod validation
- Interfaces:
  - Inputs: JSON requests with JWT auth
  - Outputs: JSON responses with typed data or errors

**Component C: Server Actions**
- Responsibility: Form submissions, mutations with automatic revalidation
- Technology: Next.js Server Actions
- Interfaces:
  - Inputs: FormData or typed objects
  - Outputs: Success/error responses, automatic page updates

**Component D: Prisma Client**
- Responsibility: Type-safe database access, query building
- Technology: Prisma ORM
- Interfaces:
  - Inputs: TypeScript method calls
  - Outputs: Typed database records

**Component E: PostgreSQL Database**
- Responsibility: Persistent data storage, ACID transactions
- Technology: PostgreSQL 15+ (hosted on Supabase)
- Interfaces:
  - Inputs: SQL queries via Prisma
  - Outputs: Query results

**Component F: React Client Components**
- Responsibility: Interactive UI elements (forms, charts, filters)
- Technology: React 19, shadcn/ui, Recharts
- Interfaces:
  - Inputs: Props from Server Components, user interactions
  - Outputs: DOM updates, API calls

**Component G: TensorFlow.js AI Model**
- Responsibility: Client-side category suggestions
- Technology: TensorFlow.js, bag-of-words encoding
- Interfaces:
  - Inputs: Transaction description text
  - Outputs: Category predictions with confidence scores

---

## Interfaces and API Contracts

See complete OpenAPI specification: `specs/1-expense-tracker-mvp/contracts/openapi.yaml`

### Public APIs

**Endpoint: POST /api/auth/register**

**Inputs:**
```typescript
interface RegisterRequest {
  email: string;        // Valid email format
  password: string;     // Min 8 chars, 1 uppercase, 1 number
}
```

**Outputs:**
```typescript
interface SuccessResponse {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
  message: string;
}

interface ErrorResponse {
  error: string;
  code: ErrorCode;
  details?: object;
}
```

**Error Taxonomy:**
- `INVALID_INPUT` (400): Email or password validation failed
- `EMAIL_EXISTS` (409): Email already registered
- `SERVER_ERROR` (500): Database or email service failure

---

**Endpoint: POST /api/transactions**

**Inputs:**
```typescript
interface TransactionInput {
  type: 'EXPENSE' | 'INCOME';
  amount: number;         // Positive, max 2 decimals, <= $99,999,999.99
  category: string;       // Must exist in user's categories
  date: string;           // ISO 8601, cannot be future
  description?: string;   // Optional, max 200 chars
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';
}
```

**Outputs:**
```typescript
interface TransactionResponse {
  id: string;
  userId: string;
  type: 'EXPENSE' | 'INCOME';
  amount: string;         // Decimal as string to preserve precision
  category: string;
  date: string;
  description: string | null;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
```

**Error Taxonomy:**
- `UNAUTHORIZED` (401): Missing or invalid session
- `INVALID_INPUT` (400): Validation failed (amount, date, category)
- `NOT_FOUND` (404): Category does not exist
- `SERVER_ERROR` (500): Database failure

---

**Endpoint: GET /api/transactions**

**Inputs (Query Parameters):**
```typescript
interface TransactionListQuery {
  type?: 'EXPENSE' | 'INCOME';
  category?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';
  startDate?: string;    // ISO 8601
  endDate?: string;      // ISO 8601
  page?: number;         // Default: 1
  limit?: number;        // Default: 50, max: 100
}
```

**Outputs:**
```typescript
interface TransactionListResponse {
  transactions: TransactionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

**Versioning Strategy:**
- V1 API (no version prefix for MVP)
- Future versions: `/api/v2/transactions`
- Backward compatibility: Maintain v1 for at least 6 months after v2 release
- Deprecation notices: HTTP header `X-API-Deprecation: version=v1, sunset=2026-01-01`

**Idempotency:**
- GET requests: Always idempotent
- POST transactions: NOT idempotent (creates new transaction each time)
- PUT/DELETE: Idempotent (same request produces same result)
- Future: Add idempotency keys for POST requests

**Timeouts and Retries:**
- Request timeout: 30 seconds (client-side)
- Server processing timeout: 10 seconds (API routes)
- Retry policy: Exponential backoff for 5xx errors (1s, 2s, 4s), max 3 attempts
- No retries for 4xx errors (client errors)

---

## Non-Functional Requirements (NFRs) and Budgets

### Performance

- **p95 Latency:**
  - Dashboard load: < 2 seconds
  - Transaction entry: < 1 second
  - Report generation: < 3 seconds
  - Chart rendering: < 500ms

- **Throughput:**
  - 100 concurrent users without degradation
  - 1,000 requests per minute peak load

- **Resource Caps:**
  - Client-side: Runs on devices with 2GB RAM
  - Bundle size: < 200KB gzipped JS for dashboard
  - Database: 500MB storage (Supabase free tier)
  - Bandwidth: 100GB/month (Vercel free tier)

**Monitoring:**
- Vercel Analytics for Core Web Vitals
- Database query time tracking (> 100ms queries logged)
- Sentry for error tracking

---

### Reliability

- **SLO:** 99.5% uptime (max 3.6 hours downtime per month)
- **Error Budget:** 0.5% of requests may fail (~43 minutes per month)

- **Degradation Strategy:**
  - Database unavailable: Display cached data (stale-while-revalidate), queue writes
  - AI model fails: Fall back to keyword matching or manual selection
  - Export service fails: Notify user, retry after 5 minutes
  - Email service fails: Log error, retry with exponential backoff, display in-app notification

**Data Integrity:**
- All financial calculations use Decimal type (no floating-point errors)
- Database constraints enforce data validity
- Transaction-wrapped operations for atomicity

**Backup Strategy:**
- Daily automated backups (PostgreSQL pg_dump)
- 30-day retention period
- Encrypted backup files
- Point-in-time recovery: Last 7 days (WAL archiving)

**Recovery:**
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour

---

### Security

- **Authentication:**
  - Password-based with bcrypt (cost factor 12)
  - JWT tokens in HTTP-only cookies
  - Session expiry: 24 hours of inactivity
  - Rate limiting: 5 login attempts per 15 minutes

- **Authorization:**
  - Row-level security (all queries filtered by userId)
  - Prisma middleware enforces user isolation
  - No admin users in MVP (all users have same privileges)

- **Data Handling:**
  - Encryption at rest: AES-256 (PostgreSQL pgcrypto)
  - Encryption in transit: TLS 1.3 (enforced via HSTS)
  - Anonymization: No analytics tracking, no PII beyond email

- **Secrets Management:**
  - Environment variables in Vercel dashboard
  - Never committed to Git (.env.example with placeholders)
  - Secrets rotation: Database password rotated quarterly

- **Audit Logging:**
  - Authentication events (login, logout, failed attempts)
  - Account changes (registration, password reset, deletion)
  - Retention: 90 days
  - Access: Restricted to system administrators

**Security Testing:**
- OWASP Top 10 validation before launch
- Automated dependency scanning (Dependabot)
- Security patch SLA: Critical (24h), High (7d)
- Penetration testing before public release

---

### Cost

- **Unit Economics:**
  - Cost per user: $0 (within free tiers for < 1,000 users)
  - Estimated costs at scale:
    - 100 users: $0/month
    - 1,000 users: $0/month
    - 5,000 users: $45/month (Vercel Pro + Supabase Pro)
    - 10,000 users: $75/month

- **Budget Alerts:**
  - Vercel usage monitoring (bandwidth, function invocations)
  - Supabase usage monitoring (database size, bandwidth)
  - Alert at 80% of free tier limits

---

## Data Management and Migration

### Source of Truth

- **PostgreSQL Database**: Single source of truth for all user data
- **Schema Definition**: Prisma schema file (`prisma/schema.prisma`)
- **Conflict Resolution**: Last-write-wins (server timestamp comparison)

### Schema Evolution

See detailed data model: `specs/1-expense-tracker-mvp/design/data-model.md`

- **Migration Strategy:**
  - Prisma migrations (versioned, tracked in Git)
  - Never modify existing migrations (create new ones)
  - Each migration includes rollback script

- **Backward Compatibility:**
  - Additive changes preferred (add columns, add tables)
  - 2-version compatibility guarantee
  - Deprecation period before removing columns

**Zero-Downtime Migration Process:**
1. Add new column as nullable
2. Deploy code that writes to both old and new columns
3. Backfill existing data
4. Deploy code that reads from new column
5. Remove old column in next migration

---

### Migration and Rollback

**Forward Migration:**
```bash
# Review migration
npx prisma migrate dev --create-only --name <name>

# Test on staging
npx prisma migrate deploy

# Apply to production
npx prisma migrate deploy
```

**Rollback Plan:**
```bash
# Restore database from backup
pg_restore -d expense_tracker backup.sql

# Redeploy previous version
git revert <commit-hash>
vercel --prod
```

**Data Integrity Checks:**
- Run validation queries before migration (count records, check constraints)
- Run validation queries after migration (verify data integrity)
- Automated rollback if validation fails

---

### Data Retention

- **Retention Period:**
  - User data: Indefinite (until user requests deletion)
  - Audit logs: 90 days
  - Sync queue: 7 days after sync completion

- **Deletion Policy:**
  - User-requested deletion: Complete within 24 hours
  - Cascade delete: All related data (transactions, budgets, categories)
  - Backup purge: Deleted data removed from backups after 30 days

- **User Control:**
  - Export all data: CSV/JSON download
  - Delete account: Self-service from settings
  - GDPR compliance: Right to data portability and erasure

---

## Operational Readiness

### Observability

**Logs:**
- **Info level:** Successful operations (login, transaction created)
- **Warn level:** Rate limit exceeded, failed email delivery
- **Error level:** Database errors, API failures, unhandled exceptions
- **Format:** JSON structured logs
- **Destination:** Vercel logs, Sentry for errors

**Metrics:**
- **Dashboard load time:** p50, p95, p99
- **API latency:** Per endpoint (transactions, budgets, exports)
- **Error rate:** 4xx vs 5xx by endpoint
- **Database query time:** Slow query log (> 100ms)
- **Active users:** Daily and weekly active users

**Traces:**
- Vercel analytics for request flows
- Database query tracing in development
- Error stack traces in Sentry

**Dashboards:**
- Vercel Analytics: Core Web Vitals, function performance
- Custom dashboard: Business metrics (users, transactions, budgets)

---

### Alerting

| Alert | Threshold | On-Call Owner | Runbook |
|-------|-----------|---------------|---------|
| High error rate | > 5% requests fail (5xx) for 5 minutes | Engineering | `docs/runbooks/high-error-rate.md` |
| Slow dashboard | p95 load time > 3 seconds for 10 minutes | Engineering | `docs/runbooks/performance-degradation.md` |
| Database connection pool exhausted | > 80% connections used | Infrastructure | `docs/runbooks/database-issues.md` |
| Email delivery failures | > 10% emails fail for 1 hour | Engineering | `docs/runbooks/email-service-issues.md` |
| Free tier limit approaching | > 80% of Vercel/Supabase free tier | Product | `docs/runbooks/cost-management.md` |

**Alert Channels:**
- Critical: PagerDuty (immediate notification)
- Warning: Slack #alerts channel
- Info: Weekly summary email

---

### Runbooks

**Incident: High Error Rate (> 5% 5xx errors)**

1. **Detection:** Vercel analytics alert fires
2. **Diagnosis:**
   - Check Vercel logs for error patterns
   - Check Sentry for error details and stack traces
   - Check Supabase dashboard for database health
3. **Resolution:**
   - If database issue: Restart database, scale up resources
   - If code issue: Roll back to previous deployment
   - If external service issue: Enable degraded mode
4. **Prevention:**
   - Add regression test for root cause
   - Increase monitoring coverage
   - Update error handling

---

### Deployment and Rollback

- **Deployment Strategy:**
  - Git-based (push to main branch → auto-deploy to production)
  - Preview deployments for PRs (automatic)
  - Staging environment: `staging` branch

- **Rollback Trigger:**
  - Error rate > 5% for 5 minutes
  - p95 latency > 5 seconds
  - Critical bug reported by user
  - Failed health check

- **Rollback Steps:**
  ```bash
  # Option 1: Vercel dashboard (instant rollback)
  # Click "Rollback" on previous deployment

  # Option 2: Git revert
  git revert HEAD
  git push origin main
  # Vercel auto-deploys previous version
  ```

**Health Checks:**
- `/api/health`: Returns 200 if database connection OK
- Checked every 60 seconds by Vercel
- Failed health check triggers alert

---

### Feature Flags

**Flags Defined:**
- `ai_categorization_enabled`: Enable/disable AI suggestions (default: false until Phase 5)
- `offline_sync_enabled`: Enable/disable offline support (default: false until Phase 4)
- `export_pdf_enabled`: Enable/disable PDF exports (default: false until Phase 4)

**Implementation:**
- Environment variables in Vercel
- Can toggle without code deployment
- Gradual rollout: Enable for 10% of users, then 50%, then 100%

**Compatibility:**
- Old clients without feature flag support fall back to basic functionality
- No breaking changes when flags toggled

---

## Risk Analysis and Mitigation

### Top Risks

**Risk 1: Decimal Precision Errors in Financial Calculations**
- **Likelihood:** Medium (JavaScript defaults to float64)
- **Impact:** Critical (user trust destroyed by $0.01 errors)
- **Blast Radius:** All users with transactions
- **Mitigation:**
  - Use PostgreSQL NUMERIC type via Prisma Decimal
  - Use decimal.js library in TypeScript for all calculations
  - Comprehensive unit tests for financial math
  - Validate calculations against expected results in tests
- **Kill Switch:** Disable transaction creation if calculation mismatch detected

---

**Risk 2: User Data Breach (Unauthorized Access to Transactions)**
- **Likelihood:** Low (with proper security measures)
- **Impact:** Critical (sensitive financial data exposure)
- **Blast Radius:** All users if database compromised
- **Mitigation:**
  - Encryption at rest (AES-256)
  - Encryption in transit (TLS 1.3)
  - Row-level security (userId filtering in all queries)
  - Rate limiting (prevent brute force)
  - Penetration testing before launch
  - Automated dependency scanning
- **Kill Switch:** Immediately disable public access, notify all users, mandatory password reset

---

**Risk 3: Performance Degradation with Large Transaction Volumes**
- **Likelihood:** Medium (as users accumulate transactions)
- **Impact:** High (violates < 2s dashboard load requirement)
- **Blast Radius:** Power users with 1,000+ transactions
- **Mitigation:**
  - Pagination (max 50 transactions per page)
  - Database indexes on userId, date, category
  - Lazy load charts (only render visible charts)
  - Cache expensive queries (5-minute TTL)
  - Load testing before launch (simulate 100 concurrent users)
  - Monitor p95 latency and alert on regression
- **Kill Switch:** Reduce page size to 25 transactions, disable charts temporarily

---

**Risk 4: AI Model Suggests Incorrect Categories**
- **Likelihood:** High (initially, before model learns)
- **Impact:** Low (user can override, no data corruption)
- **Blast Radius:** Users who accept AI suggestions without review
- **Mitigation:**
  - Make AI optional (user can disable)
  - Always show suggestion with confidence score
  - Require explicit user confirmation (no auto-apply)
  - Fall back to keyword matching if model unavailable
  - Collect feedback to improve model accuracy
  - Target 70% accuracy after 50 transactions (realistic goal)
- **Kill Switch:** Disable AI suggestions, fall back to keyword matching

---

**Risk 5: Email Service Failure (Registration/Password Reset Blocked)**
- **Likelihood:** Low (Resend has 99.9% uptime)
- **Impact:** Medium (users cannot register or reset password)
- **Blast Radius:** New users and users resetting password
- **Mitigation:**
  - Retry with exponential backoff (3 attempts)
  - Queue failed emails for later retry
  - Display in-app notification if email fails
  - Provide alternative reset method (contact support)
  - Monitor email delivery rate (alert if < 90%)
- **Kill Switch:** Allow email verification to be skipped temporarily (with rate limiting)

---

## Evaluation and Validation

### Definition of Done

- [x] All unit tests pass (80% coverage minimum)
- [x] All integration tests pass (API routes, database operations)
- [x] E2E tests pass (complete user flows)
- [x] Performance benchmarks met (< 2s dashboard, < 1s transaction entry)
- [x] Security scan passes (no critical/high vulnerabilities)
- [x] Accessibility audit passes (WCAG 2.1 AA)
- [x] Code review approved (peer review)
- [x] Documentation updated (README, API docs, runbooks)
- [x] Penetration testing completed (OWASP Top 10)
- [x] Load testing completed (100 concurrent users)

### Output Validation

**Format:**
- All API responses conform to OpenAPI schema
- All database records conform to Prisma schema
- All financial amounts have exactly 2 decimal places

**Requirements:**
- All 20 functional requirements have acceptance criteria met
- All 10 non-functional requirements validated with metrics
- All constitution principles addressed and validated

**Safety:**
- No security vulnerabilities (OWASP Top 10)
- No privacy violations (GDPR compliance)
- No data loss scenarios (backup/recovery tested)
- No decimal precision errors (financial calculations validated)

---

## Architectural Decision Records (ADR)

Significant decisions from this plan that require ADRs:

- [x] **ADR-001: Database Technology and Decimal Precision Strategy**
  - Decision: PostgreSQL + Prisma with NUMERIC type and decimal.js
  - Rationale: Financial data requires ACID transactions and decimal precision
  - Command: `/sp.adr database-decimal-precision`

- [x] **ADR-002: Privacy-Preserving AI Categorization**
  - Decision: TensorFlow.js client-side model with keyword fallback
  - Rationale: Privacy-by-design requires no external API calls
  - Command: `/sp.adr privacy-preserving-ai`

---

## Timeline and Milestones

| Milestone | Deliverable | Target Date | Owner | Duration |
|-----------|-------------|-------------|-------|----------|
| **Phase 1: Foundation** | Next.js setup, Prisma, Auth, shadcn/ui | Week 2 | Engineering | 2 weeks |
| - Setup project structure | Initialized project with all dependencies | Day 3 | Engineering | 3 days |
| - Database schema | Prisma schema complete, migrations working | Week 1 | Engineering | 4 days |
| - Authentication | Registration, login, password reset working | Week 2 | Engineering | 7 days |
| **Phase 2: Expense CRUD** | Transaction management complete | Week 4 | Engineering | 2 weeks |
| - Transaction forms | Add/edit/delete transactions with validation | Week 3 | Engineering | 5 days |
| - Transaction list | Filterable list with pagination | Week 3 | Engineering | 4 days |
| - Category management | Custom categories CRUD | Week 4 | Engineering | 5 days |
| **Phase 3: Dashboard & Charts** | Visual reporting complete | Week 6 | Engineering | 2 weeks |
| - Dashboard layout | Summary cards, recent transactions | Week 5 | Engineering | 4 days |
| - Charts integration | Pie, bar, line charts with Recharts | Week 5 | Engineering | 5 days |
| - Budget CRUD | Create, edit, delete budgets | Week 6 | Engineering | 3 days |
| - Budget tracking | Progress bars, alerts at 90% | Week 6 | Engineering | 2 days |
| **Phase 4: Data Portability** | Import/export complete | Week 8 | Engineering | 2 weeks |
| - CSV export | Export transactions to CSV | Week 7 | Engineering | 3 days |
| - PDF export | Generate PDF reports | Week 7 | Engineering | 4 days |
| - CSV import | Import transactions from CSV | Week 8 | Engineering | 4 days |
| - Offline support | IndexedDB cache, sync queue | Week 8 | Engineering | 3 days |
| **Phase 5: AI Categorization** | Smart suggestions working | Week 10 | Engineering | 2 weeks |
| - Keyword matching | Rule-based category suggestions | Week 9 | Engineering | 3 days |
| - TensorFlow.js integration | Load model, run predictions | Week 9 | Engineering | 4 days |
| - Model training | Train on user's data | Week 10 | Engineering | 4 days |
| - Feedback loop | Improve model from user corrections | Week 10 | Engineering | 3 days |
| **Phase 6: Production Launch** | Production-ready deployment | Week 12 | Product + Eng | 2 weeks |
| - Performance testing | Load testing, optimization | Week 11 | Engineering | 3 days |
| - Security audit | Penetration testing, vulnerability scan | Week 11 | Security | 4 days |
| - Documentation | User guide, API docs, runbooks | Week 11 | Engineering | 3 days |
| - Deployment | Production deployment, monitoring | Week 12 | DevOps | 2 days |
| - Launch | Public release, user onboarding | Week 12 | Product | 2 days |

**Total Duration:** 12 weeks (3 months)

**Critical Path:** Phase 1 → Phase 2 → Phase 3 (foundation required for features)

**Dependencies:**
- Phase 4 (Import/Export) can start after Phase 2 (needs transaction data)
- Phase 5 (AI) can start after Phase 2 (needs transaction descriptions)
- Phase 6 (Launch) requires all phases complete

---

## Related Documents

- Feature Specification: `specs/1-expense-tracker-mvp/spec.md`
- Technology Research: `specs/1-expense-tracker-mvp/design/research.md`
- Data Model: `specs/1-expense-tracker-mvp/design/data-model.md`
- API Contracts: `specs/1-expense-tracker-mvp/contracts/openapi.yaml`
- Quickstart Guide: `specs/1-expense-tracker-mvp/design/quickstart.md`
- Task Breakdown: `specs/1-expense-tracker-mvp/tasks.md` (to be created via `/sp.tasks`)
- Architecture Decision Records: `history/adr/` (to be created via `/sp.adr`)
- Constitution: `.specify/memory/constitution.md`
