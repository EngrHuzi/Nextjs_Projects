# Technology Research and Decisions

**Feature:** Expense Tracker MVP
**Date:** 2025-11-04
**Status:** Complete

---

## Overview

This document captures all technology decisions, rationale, and alternatives considered for the Expense Tracker MVP. Each decision aligns with the constitution principles of simplicity, security, privacy, and maintainability.

---

## Technology Stack Decisions

### 1. Frontend Framework: Next.js 16 (App Router)

**Decision:** Use Next.js 16 with App Router for the full-stack application

**Rationale:**
- **Server Components**: Reduce client-side JavaScript, improve performance
- **Built-in API Routes**: Eliminate need for separate backend framework
- **File-based routing**: Simplifies project structure and navigation
- **SSR/SSG Support**: Improves initial page load and SEO
- **Vercel Integration**: Seamless deployment with CI/CD
- **TypeScript Support**: Native first-class TypeScript integration
- **Already Installed**: Project already initialized with Next.js 16

**Alternatives Considered:**
1. **React SPA + Express Backend**
   - Pros: More flexibility, familiar pattern
   - Cons: More complex deployment, separate codebases, higher hosting costs
   - Why rejected: Increases complexity without significant benefit for MVP

2. **Vue.js + Nuxt**
   - Pros: Simpler learning curve, good SSR support
   - Cons: Smaller ecosystem for financial apps, team unfamiliarity
   - Why rejected: Next.js has better TypeScript support and larger community

3. **Remix**
   - Pros: Modern routing, excellent data loading patterns
   - Cons: Newer framework, smaller ecosystem, less mature tooling
   - Why rejected: Next.js is more established with better documentation

**Constitution Alignment:**
- ✅ Simplicity: File-based routing reduces complexity
- ✅ Performance: Server components improve load times (< 2s requirement)
- ✅ Maintainability: Large community, excellent documentation

---

### 2. UI Component Library: shadcn/ui + Tailwind CSS

**Decision:** Use shadcn/ui components with Tailwind CSS for styling

**Rationale:**
- **Copy-paste philosophy**: Components live in our codebase, full control
- **Accessibility**: Components built with Radix UI primitives (WCAG 2.1 AA)
- **Customization**: Full control over styling and behavior
- **TypeScript**: Excellent TypeScript support out of the box
- **Tailwind Integration**: Consistent utility-first styling approach
- **Dark Mode**: Built-in dark mode support
- **No runtime overhead**: Tailwind purges unused CSS

**Alternatives Considered:**
1. **Material-UI (MUI)**
   - Pros: Comprehensive component library, mature
   - Cons: Large bundle size, opinionated design, harder to customize
   - Why rejected: Bundle size conflicts with performance requirements

2. **Chakra UI**
   - Pros: Good accessibility, theme customization
   - Cons: Runtime CSS-in-JS overhead, larger bundle
   - Why rejected: Performance overhead not suitable for 2s dashboard load requirement

3. **Ant Design**
   - Pros: Enterprise-ready, comprehensive
   - Cons: Heavy bundle, opinionated design, harder to make simple
   - Why rejected: Conflicts with "simplicity over feature creep" principle

**Constitution Alignment:**
- ✅ Accessibility: Radix UI ensures WCAG 2.1 AA compliance
- ✅ Performance: No runtime CSS-in-JS overhead
- ✅ Simplicity: Focused component set, not overwhelming
- ✅ Maintainability: Components in our codebase, full control

---

### 3. Database: PostgreSQL + Prisma ORM

**Decision:** Use PostgreSQL as primary database with Prisma ORM

**Rationale:**
- **ACID Compliance**: Financial data requires transactional integrity
- **Data Types**: Excellent support for decimal/numeric types (no floating-point errors)
- **Schema Versioning**: Prisma migrations provide version control for schema
- **Type Safety**: Prisma generates TypeScript types from schema
- **Free Tier**: Supabase, Railway, Neon offer generous free PostgreSQL hosting
- **Performance**: Excellent query optimization and indexing
- **Backup**: Point-in-time recovery (PITR) for data protection

**Alternatives Considered:**
1. **MongoDB + Mongoose**
   - Pros: Flexible schema, easy to start
   - Cons: No ACID transactions (before v4), decimal handling issues, not ideal for financial data
   - Why rejected: Financial data requires strong consistency and precise decimal math

2. **MySQL + Prisma**
   - Pros: Familiar, good performance
   - Cons: Less robust JSONB support, inferior window functions
   - Why rejected: PostgreSQL has better JSON and analytical query support

3. **SQLite**
   - Pros: Zero-config, lightweight, fast
   - Cons: No multi-user concurrency, challenging for cloud deployment, no user isolation
   - Why rejected: Not suitable for multi-tenant SaaS with 10,000 user target

**Constitution Alignment:**
- ✅ Data Integrity: ACID transactions prevent data corruption
- ✅ Transparency: Schema as code (Prisma schema) is version-controlled
- ✅ Privacy: Row-level security possible for data isolation
- ✅ Reliability: Battle-tested, proven at scale

**Decimal Precision Strategy:**
- Use `Decimal` type in Prisma (maps to PostgreSQL `NUMERIC`)
- Store amounts as integers (cents) to avoid floating-point errors
- All financial calculations use `decimal.js` library in TypeScript

---

### 4. Authentication: NextAuth.js v5

**Decision:** Use NextAuth.js (Auth.js) for authentication

**Rationale:**
- **Next.js Integration**: Built specifically for Next.js App Router
- **Email/Password**: Supports credentials provider for MVP
- **Session Management**: Secure JWT or database sessions
- **CSRF Protection**: Built-in CSRF token management
- **Future Extensions**: Easy to add OAuth providers later
- **Type Safety**: Full TypeScript support
- **Community**: Large community, actively maintained

**Alternatives Considered:**
1. **Clerk**
   - Pros: Beautiful UI, easy setup, managed service
   - Cons: Third-party dependency, data privacy concerns, costs money
   - Why rejected: Conflicts with privacy-by-design (user data on third-party servers)

2. **Auth0**
   - Pros: Enterprise-grade, feature-rich
   - Cons: Complex, third-party, expensive for scale
   - Why rejected: Overkill for MVP, privacy concerns, costs

3. **Custom JWT Implementation**
   - Pros: Full control, lightweight
   - Cons: Security risks, need to handle edge cases, more development time
   - Why rejected: NextAuth provides security best practices out of the box

**Security Implementation:**
- Bcrypt for password hashing (cost factor 12)
- HTTP-only cookies for session tokens
- SameSite=Strict for CSRF protection
- Session expiry after 24 hours of inactivity
- Rate limiting on login endpoints (max 5 attempts per 15 minutes)

**Constitution Alignment:**
- ✅ Security: Proven security patterns, CSRF protection
- ✅ Privacy: Self-hosted, no third-party data sharing
- ✅ Simplicity: Reduces custom auth code complexity

---

### 5. Charts and Visualization: Recharts

**Decision:** Use Recharts for all chart visualizations

**Rationale:**
- **React Native**: Built specifically for React, composable API
- **Responsive**: Charts adapt to screen size automatically
- **Accessibility**: SVG-based, screen reader friendly
- **Customization**: Full control over styling and behavior
- **Performance**: Lightweight, no heavy dependencies
- **TypeScript**: Excellent TypeScript definitions
- **MIT License**: Open-source, no licensing issues

**Alternatives Considered:**
1. **Chart.js + react-chartjs-2**
   - Pros: Popular, feature-rich, good documentation
   - Cons: Canvas-based (less accessible), imperative API
   - Why rejected: Less React-friendly, accessibility concerns

2. **Victory**
   - Pros: Declarative, React-based
   - Cons: Larger bundle size, more complex
   - Why rejected: Recharts is simpler for MVP needs

3. **D3.js**
   - Pros: Most powerful, infinite customization
   - Cons: Steep learning curve, verbose for simple charts, large bundle
   - Why rejected: Overkill for simple pie/bar/line charts

**Chart Requirements:**
- Pie chart: Spending distribution by category
- Bar chart: Category comparison
- Line chart: Spending trends over time (30/90/365 days)
- All charts must:
  - Load in < 500ms
  - Be interactive (hover tooltips, click to filter)
  - Render correctly on mobile (320px width)
  - Support dark mode

**Constitution Alignment:**
- ✅ Accessibility: SVG-based, screen reader support
- ✅ Performance: Lightweight library meets < 500ms requirement
- ✅ Simplicity: Declarative React API is easy to maintain

---

### 6. AI Categorization: TensorFlow.js (Phase 5)

**Decision:** Use TensorFlow.js with client-side model for AI categorization

**Rationale:**
- **Privacy-Preserving**: Model runs entirely in browser, no data sent to servers
- **Zero External Dependencies**: No third-party AI services
- **Offline Support**: Works without internet connection
- **Free**: No API costs
- **Transparency**: Model behavior is auditable
- **User Control**: Easy to disable or override suggestions

**Alternatives Considered:**
1. **Hugging Face API**
   - Pros: Powerful models, easy integration
   - Cons: Requires sending transaction data to third-party, privacy violation, API costs
   - Why rejected: Violates privacy-by-design principle (no third-party data sharing)

2. **OpenAI API**
   - Pros: Very accurate, easy to use
   - Cons: Expensive, sends data to OpenAI, privacy concerns
   - Why rejected: Violates constitution (user data must never leave system)

3. **Simple Rule-Based System**
   - Pros: Transparent, no ML overhead
   - Cons: Less accurate, requires manual rule creation
   - Why rejected: Spec requires AI-assisted suggestions, rule-based is fallback

**Implementation Approach:**
- Start with simple keyword matching (Phase 2-4)
- Train small text classification model on user's own data (Phase 5)
- Model size: < 10MB (fits in browser cache)
- Accuracy target: 70% after 50 transactions
- Fallback to keyword matching if model unavailable
- User can always override suggestions

**Model Architecture:**
- Bag-of-words or TF-IDF for text encoding
- Small neural network (2-3 layers, < 1000 parameters)
- Train on user's historical category assignments
- Update model incrementally as user adds transactions

**Constitution Alignment:**
- ✅ Privacy: Zero data sent to external services
- ✅ Transparency: Model behavior is inspectable
- ✅ User Control: Suggestions are optional, user has final say
- ✅ Simplicity: Fallback to simple keyword matching

---

### 7. Form Handling: React Hook Form + Zod

**Decision:** Use React Hook Form for forms and Zod for validation

**Rationale:**
- **Performance**: Minimal re-renders, better than Formik
- **Type Safety**: Zod schemas provide runtime validation and TypeScript types
- **Developer Experience**: Simple API, easy to use
- **Bundle Size**: Lightweight (< 30KB combined)
- **Integration**: Works seamlessly with shadcn/ui form components
- **Error Handling**: Clear, accessible error messages

**Alternatives Considered:**
1. **Formik**
   - Pros: Popular, feature-rich
   - Cons: More re-renders, larger bundle, slower
   - Why rejected: Performance overhead not suitable for < 10s expense entry requirement

2. **Native HTML Forms**
   - Pros: Zero dependencies, fastest
   - Cons: Verbose validation, poor UX for complex forms
   - Why rejected: Need sophisticated validation for financial data

**Validation Rules:**
- Amount: Required, positive number, max 2 decimal places, > 0, < $1,000,000
- Category: Required, must exist in user's categories
- Date: Required, cannot be in future, max 1 year in past
- Description: Optional, max 200 characters
- Payment Method: Required, enum validation

**Constitution Alignment:**
- ✅ Usability: Fast, responsive forms support < 10s entry time
- ✅ Data Integrity: Strong validation prevents bad data
- ✅ Accessibility: Clear error messages, screen reader friendly

---

### 8. Testing: Jest + Playwright + Testing Library

**Decision:** Use Jest for unit tests, Playwright for E2E, React Testing Library for components

**Rationale:**
- **Jest**: Standard for React/Next.js, excellent mocking, fast
- **Playwright**: Cross-browser testing, reliable, modern
- **Testing Library**: Encourages accessible, user-centric tests
- **Coverage**: All three together achieve 80% coverage requirement
- **CI Integration**: All run easily in GitHub Actions

**Alternatives Considered:**
1. **Cypress**
   - Pros: Great DX, time-travel debugging
   - Cons: Only tests in Chromium-based browsers, slower than Playwright
   - Why rejected: Playwright supports more browsers, faster execution

2. **Vitest**
   - Pros: Faster than Jest, better Vite integration
   - Cons: Next.js better supported by Jest, smaller community
   - Why rejected: Jest is standard for Next.js, proven setup

**Testing Strategy:**
- Unit Tests (Jest): Business logic, utilities, calculations
- Component Tests (Testing Library): UI components, user interactions
- Integration Tests (Playwright): API routes, database operations
- E2E Tests (Playwright): Complete user flows (registration → expense entry → report export)

**Coverage Targets:**
- Overall: 80% minimum
- Critical paths (auth, transactions, budgets): 95%+
- UI components: 70%+

**Constitution Alignment:**
- ✅ Validation Before Deployment: Comprehensive test suite
- ✅ Reliability: 80% coverage ensures quality
- ✅ Continuous Learning: Tests document expected behavior

---

### 9. Deployment: Vercel

**Decision:** Deploy to Vercel for hosting

**Rationale:**
- **Next.js Native**: Built by same team, best integration
- **Free Tier**: Generous limits suitable for MVP (100GB bandwidth, unlimited requests)
- **CI/CD**: Automatic deployments from Git
- **Preview Deployments**: Every PR gets preview URL
- **Edge Functions**: Global CDN for fast response times
- **PostgreSQL Integration**: Easy connection to Supabase/Neon/Railway
- **Environment Variables**: Secure secret management
- **Analytics**: Built-in web vitals tracking

**Alternatives Considered:**
1. **Railway**
   - Pros: Simple, includes database, fair pricing
   - Cons: $5/month minimum, no free tier for full stack
   - Why rejected: Vercel free tier better for MVP launch

2. **AWS (Amplify or EC2)**
   - Pros: Extremely scalable, many services
   - Cons: Complex, expensive, steep learning curve
   - Why rejected: Overkill for MVP, violates simplicity principle

3. **Netlify**
   - Pros: Good DX, free tier
   - Cons: Less optimized for Next.js than Vercel, serverless functions are slower
   - Why rejected: Vercel is superior for Next.js apps

**Hosting Costs Estimate (MVP with 100 users):**
- Vercel: $0/month (within free tier)
- PostgreSQL (Supabase): $0/month (within free tier: 500MB database, 2GB transfer)
- Total: $0/month ✅ (Well under $100/month budget)

**Scaling Path:**
- 100-1,000 users: Still free tier
- 1,000-5,000 users: Vercel Pro ($20/month) + Supabase Pro ($25/month) = $45/month
- 5,000-10,000 users: $45-$75/month
- Always under $100/month for MVP phase

**Constitution Alignment:**
- ✅ Simplicity: One-click deployment, minimal configuration
- ✅ Reliability: 99.9% uptime SLA
- ✅ Cost: Free for MVP, under budget at scale

---

### 10. Email Service: Resend

**Decision:** Use Resend for transactional emails

**Rationale:**
- **Free Tier**: 3,000 emails/month free (sufficient for MVP)
- **Simple API**: Clean, modern API built for Next.js
- **React Email**: Send React components as emails
- **Deliverability**: High inbox delivery rates
- **TypeScript**: First-class TypeScript support
- **No Credit Card**: Free tier doesn't require payment method

**Alternatives Considered:**
1. **SendGrid**
   - Pros: Established, reliable, 100 emails/day free
   - Cons: Complex API, dated documentation, 100/day limit too low
   - Why rejected: Limit too restrictive for user registration flow

2. **AWS SES**
   - Pros: Very cheap, reliable
   - Cons: Complex setup, requires AWS account, verification process
   - Why rejected: Too complex for MVP

3. **Mailgun**
   - Pros: Reliable, good API
   - Cons: Free tier requires credit card, EU region restrictions
   - Why rejected: Credit card requirement is barrier for MVP

**Email Types:**
- Registration verification
- Password reset
- Budget alerts (optional, user opt-in)
- Daily expense reminders (optional, user opt-in)

**Rate Limits:**
- Registration: Max 1 email per user per hour
- Password reset: Max 3 emails per user per day
- Notifications: Max 1 email per user per day

**Constitution Alignment:**
- ✅ Privacy: No marketing emails, user controls all notifications
- ✅ Cost: Free tier covers MVP needs
- ✅ Simplicity: Clean API, easy integration

---

## Architecture Patterns

### 1. API Route Organization

**Pattern:** Feature-based API route structure

```
app/api/
├── auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   └── reset-password/route.ts
├── transactions/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/route.ts         # GET, PUT, DELETE (single)
├── categories/
│   ├── route.ts
│   └── [id]/route.ts
├── budgets/
│   ├── route.ts
│   └── [id]/route.ts
└── export/
    ├── csv/route.ts
    └── pdf/route.ts
```

**Rationale:**
- Feature cohesion: Related endpoints grouped together
- Clear URL patterns: RESTful conventions
- Easy to find: Developers can locate endpoints quickly
- Scales well: Can add features without restructuring

---

### 2. Server Actions for Mutations

**Pattern:** Use Server Actions for form submissions, API routes for queries

**Rationale:**
- Server Actions provide better type safety for mutations
- Automatic revalidation of Server Components
- Progressive enhancement (works without JavaScript)
- Simpler error handling

**Example:**
```typescript
// app/actions/transactions.ts
'use server'

export async function createTransaction(data: TransactionInput) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  const transaction = await db.transaction.create({
    data: { ...data, userId: session.user.id }
  })

  revalidatePath('/dashboard')
  return transaction
}
```

---

### 3. Data Fetching Strategy

**Pattern:** React Server Components for initial data, client components for interactivity

**Rationale:**
- Server Components reduce client-side JavaScript (performance)
- Easier to fetch data in Server Components (no loading states)
- Client components only where needed (forms, charts, interactivity)

**Example:**
```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const session = await auth()
  const transactions = await getTransactions(session.user.id)

  return <DashboardClient transactions={transactions} />
}

// components/DashboardClient.tsx ('use client')
'use client'
export function DashboardClient({ transactions }) {
  // Interactive charts and filters
}
```

---

## Security Decisions

### 1. Password Security

**Implementation:**
- Bcrypt hashing with cost factor 12
- Minimum password length: 8 characters
- Require: 1 uppercase, 1 lowercase, 1 number
- No password reuse (store hash history)
- Password reset tokens expire in 1 hour
- Tokens are single-use (invalidated after use)

**Rationale:**
- Bcrypt is slow by design (prevents brute force)
- Cost factor 12 balances security and performance
- Complexity requirements prevent weak passwords

---

### 2. Session Management

**Implementation:**
- JWT tokens stored in HTTP-only cookies
- SameSite=Strict (prevent CSRF)
- Secure flag in production (HTTPS only)
- 24-hour session expiry
- Session refresh on activity
- Logout invalidates token server-side

**Rationale:**
- HTTP-only prevents XSS attacks
- SameSite=Strict prevents CSRF
- Short expiry limits attack window
- Server-side invalidation prevents token replay

---

### 3. Rate Limiting

**Implementation:**
- IP-based rate limiting
- Login: 5 attempts per 15 minutes
- Registration: 3 attempts per hour
- Password reset: 3 attempts per hour
- API: 100 requests per minute per user

**Rationale:**
- Prevents brute force attacks
- Prevents DoS attacks
- Prevents abuse of email sending

**Library:** `@upstash/ratelimit` with Redis (or in-memory for MVP)

---

### 4. Input Validation

**Implementation:**
- Client-side: Zod schemas in React Hook Form
- Server-side: Same Zod schemas reused
- Database: Prisma schema constraints
- Sanitization: DOMPurify for any HTML (future rich text)

**Rationale:**
- Defense in depth (validate everywhere)
- Type safety (Zod generates TypeScript types)
- XSS prevention (sanitize before rendering)

---

## Performance Optimizations

### 1. Caching Strategy

**Implementation:**
- Static pages: Cached indefinitely (landing page)
- Dashboard: ISR with 60-second revalidation
- Transaction list: Client-side React Query cache (5 minutes)
- Charts: Memoized calculations
- Images: Next.js Image component (automatic optimization)

**Rationale:**
- Reduces database queries
- Improves perceived performance
- Meets < 2s dashboard load requirement

---

### 2. Database Optimization

**Implementation:**
- Indexes on frequently queried columns (userId, date, category)
- Compound indexes for common filters
- Connection pooling (Prisma default)
- Query optimization (select only needed fields)
- Pagination for large result sets (50 transactions per page)

**Rationale:**
- Fast queries (< 100ms p95)
- Supports 10,000 users with 10M transactions
- Prevents slow queries from blocking other users

---

### 3. Bundle Optimization

**Implementation:**
- Code splitting (automatic with Next.js)
- Dynamic imports for heavy components (charts, PDF export)
- Tree shaking (remove unused code)
- Minification and compression (production builds)
- Image optimization (WebP, responsive sizes)

**Rationale:**
- Fast initial page load (< 2s)
- Smaller bundle size (< 200KB gzipped JS for dashboard)
- Better Core Web Vitals scores

---

## Privacy and Compliance

### 1. Data Storage

**Implementation:**
- Encryption at rest: PostgreSQL with pgcrypto extension
- Encryption in transit: TLS 1.3 for all connections
- Data isolation: Row-level security (RLS) in Prisma queries
- No analytics: No Google Analytics, no third-party trackers
- Session data: Minimal (user ID only)

**Rationale:**
- Meets AES-256 encryption requirement
- Prevents data leaks between users
- Respects privacy-by-design principle

---

### 2. GDPR Compliance

**Implementation:**
- Data export: CSV/JSON download of all user data
- Data deletion: Permanent removal within 24 hours
- Consent: Explicit checkbox during registration
- Privacy policy: Clear, accessible before signup
- Audit logs: 90 days retention for security events

**Rationale:**
- GDPR right to data portability
- GDPR right to be forgotten
- GDPR requires explicit consent
- GDPR requires transparency

---

## Open Source Dependencies

All dependencies use permissive licenses (MIT, Apache 2.0, BSD):

| Package | License | Purpose |
|---------|---------|---------|
| Next.js | MIT | Framework |
| React | MIT | UI library |
| TypeScript | Apache 2.0 | Language |
| Prisma | Apache 2.0 | ORM |
| NextAuth.js | ISC | Authentication |
| Tailwind CSS | MIT | Styling |
| shadcn/ui | MIT | Components |
| Recharts | MIT | Charts |
| Zod | MIT | Validation |
| React Hook Form | MIT | Forms |
| TensorFlow.js | Apache 2.0 | AI |
| Jest | MIT | Testing |
| Playwright | Apache 2.0 | E2E Testing |
| Resend | MIT | Email |

**Constitution Alignment:**
- ✅ All licenses are permissive (no GPL, no copyleft)
- ✅ No licensing restrictions on commercial use
- ✅ Meets "open-source dependencies with permissive licenses" constraint

---

## Risk Mitigation Strategies

### 1. Database Migration Failures

**Risk:** Prisma migration breaks production data
**Likelihood:** Medium
**Impact:** High

**Mitigation:**
- Always backup before migration
- Test migrations on staging environment first
- Use Prisma migrate --create-only for review
- Rollback scripts for every migration
- Blue-green deployment for zero downtime

---

### 2. AI Model Inaccuracies

**Risk:** AI categorization suggests wrong categories
**Likelihood:** High (initially)
**Impact:** Low (user can override)

**Mitigation:**
- Make AI optional (user can disable)
- Allow immediate override
- Collect feedback to improve model
- Fall back to keyword matching
- Never auto-apply suggestions without confirmation

---

### 3. Performance Regressions

**Risk:** Dashboard becomes slow as data grows
**Likelihood:** Medium
**Impact:** High (violates < 2s requirement)

**Mitigation:**
- Pagination (max 50 transactions per page)
- Lazy load charts (only visible ones)
- Database indexes on all query fields
- Monitor performance with Vercel Analytics
- Load testing before launch (simulate 100 concurrent users)

---

### 4. Security Vulnerabilities

**Risk:** Dependency vulnerabilities introduce security holes
**Likelihood:** High (over time)
**Impact:** Critical

**Mitigation:**
- Automated dependency scanning (Dependabot)
- Weekly dependency updates
- Security patch SLA: critical (24h), high (7d)
- Penetration testing before launch
- Bug bounty program post-launch

---

## Development Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Phase 1: Foundation | 2 weeks | Next.js + shadcn + Auth |
| Phase 2: Expense CRUD | 2 weeks | Full expense management |
| Phase 3: Dashboard | 2 weeks | Charts + budgets |
| Phase 4: Data Portability | 2 weeks | Export/import |
| Phase 5: AI Categorization | 2 weeks | Smart suggestions |
| Phase 6: Launch | 2 weeks | Production-ready |
| **Total** | **12 weeks** | **v1.0 MVP** |

---

## Conclusion

All technology decisions align with the constitution principles:
- ✅ Privacy-preserving AI (local models only)
- ✅ Security-first (encryption, auth best practices)
- ✅ Simplicity over complexity (modern stack, clear patterns)
- ✅ User control (can disable AI, delete data, export everything)
- ✅ Performance (meets all latency requirements)
- ✅ Cost-effective (free hosting for MVP)
- ✅ Open source (all permissive licenses)

No unresolved research items. Ready to proceed to Phase 1 (Data Model and API Contracts).
