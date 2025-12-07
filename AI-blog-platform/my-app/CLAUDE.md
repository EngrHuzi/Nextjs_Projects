# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered blog platform built with Next.js 15, featuring AI-assisted content creation (via Google's Gemini API), JWT-based authentication, PostgreSQL database with Prisma ORM, and a comprehensive admin dashboard.

Live demo: https://aiblogify.vercel.app/

## Development Commands

### Development Server
```bash
npm run dev          # Start development server with Turbopack on port 3000
npm run build        # Build for production (includes Prisma generate)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Management
```bash
npm run prisma:generate    # Generate Prisma client (auto-runs on postinstall)
npm run prisma:migrate     # Deploy migrations
npm run prisma:studio      # Open Prisma Studio GUI
npm run db:setup          # Initialize database with sample data
npm run db:setup-neon     # Setup NeonDB (serverless PostgreSQL)
npm run db:migrate-users  # User migration script
```

### Testing
```bash
npm run test         # Run Jest tests
npm run test:watch   # Run Jest in watch mode
```

## Architecture

### Next.js 15 App Router Structure

The application uses the Next.js App Router (not Pages Router). All routes are in the `app/` directory:
- `app/api/` - API routes (server-side only)
- `app/admin/` - Admin dashboard pages (requires ADMIN role)
- `app/auth/` - Authentication pages
- `app/blog/` - Blog management pages
- `app/page.tsx` - Landing page

### Authentication Flow

The platform uses JWT-based authentication with the following architecture:

1. **JWT Tokens**: Stored in httpOnly cookies (primary) and Authorization headers (fallback)
2. **Middleware**: `/middleware.ts` handles authentication and authorization for protected routes
3. **Role-Based Access Control**: USER and ADMIN roles (defined in Prisma schema)
4. **Rate Limiting**: Built-in rate limiting for auth and admin routes (configurable per environment)
5. **Email Verification**: OTP-based email verification system for new registrations

**Authentication Context**: The `contexts/auth-context.tsx` provides global auth state using React Context. It manages user state, login/logout, and registration flows.

**Protected Routes**:
- `/admin/*` and `/api/admin/*` - ADMIN role required
- Middleware automatically redirects unauthorized users to `/login` with a return URL

### AI Integration

The platform integrates with Google's Gemini API (`lib/ai.ts`) to provide:
- Title suggestions based on content and category
- Content summarization with key points extraction
- SEO keyword generation and meta descriptions
- Content improvement (grammar, clarity, engagement)

All AI functions call the Gemini API with structured JSON responses and handle markdown code block cleanup automatically.

### Database Schema (Prisma)

Core models:
- **User**: email, name, password (hashed), role (USER/ADMIN), emailVerified, otpCode, otpExpiresAt
- **Post**: title, content, excerpt, category, tags[], status (DRAFT/PUBLISHED), slug, readTime, authorId
- **Comment**: content, postId, authorId

**Relations**:
- User -> Post (one-to-many via authorId, cascade delete)
- User -> Comment (one-to-many via authorId, cascade delete)
- Post -> Comment (one-to-many via postId, cascade delete)

### State Management

The application uses React Context for global state:
- **AuthContext** (`contexts/auth-context.tsx`): User authentication state, login/logout, OTP verification
- **ThemeContext** (`contexts/theme-context.tsx`): Theme management (light/dark/system)

### Component Organization

```
components/
├── admin/              # Admin dashboard components (tables, stats, settings)
├── auth/               # Auth components (login/register forms, user menu)
├── layout/             # Header and Footer components
├── landing/            # Landing page sections
├── ui/                 # Reusable shadcn/ui components
├── ai-assistant.tsx    # AI content generation interface
├── blog-editor.tsx     # Rich blog post editor
└── comment-section.tsx # Comment system
```

### API Route Patterns

All API routes follow Next.js 15 conventions:
- Use `export async function GET/POST/PATCH/DELETE(request: Request, { params }: { params: Promise<{ id: string }> })` for route handlers
- Always await `params` before accessing route parameters
- Return `NextResponse.json()` for all API responses
- Include proper error handling with appropriate HTTP status codes

### Middleware & Security

The application implements comprehensive security in `middleware.ts`:
- **Rate Limiting**: Configurable per environment (development vs production)
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy
- **JWT Verification**: Validates tokens from cookies or Authorization headers
- **Role-Based Access**: Enforces ADMIN role for protected routes
- **CORS**: Handled via security headers

### Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string (local or NeonDB)
- `JWT_SECRET` - Secret key for JWT token signing
- `NEXTAUTH_SECRET` - NextAuth secret (legacy, may be removed)
- `GOOGLE_AI_API_KEY` - Google Gemini API key for AI features
- `GEMINI_API_KEY` - Alternative Gemini API key (used in lib/ai.ts)

### TypeScript Configuration

- Base URL: `"."` with path alias `@/*` for absolute imports
- Target: ES2017
- Strict mode enabled
- Next.js plugin included for type generation

## Important Implementation Notes

### Next.js 15 Breaking Changes
- Route parameters must be awaited: `const { id } = await params`
- Dynamic route handlers receive params as a Promise

### Authentication Patterns
- Always check authentication via middleware (don't duplicate auth logic in API routes)
- User data is cached in localStorage for faster page loads (synced with API)
- Logout clears both httpOnly cookies and localStorage

### Database Connections
- Prisma client is initialized in `lib/db.ts`
- Connection pooling is handled automatically by Prisma
- Use `prisma generate` after schema changes

### AI Service Usage
- All AI responses are structured JSON
- Implement proper error handling (fallback to original content)
- Clean up markdown code blocks from responses

### Theme System
- System theme detection with manual override
- Persists theme preference to localStorage
- Theme toggle available in header component

## Testing

Jest is configured with:
- `jest.config.ts` - Main configuration
- `jest.setup.ts` - Setup file with testing library
- `next-router-mock` for mocking Next.js router in tests
- Test files in `__tests__/` directory

## Common Patterns

### Creating Protected API Routes
```typescript
// Middleware handles authentication, so just verify user context
const token = cookies().get('auth_token')?.value
if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
const payload = await verifyJWT(token)
```

### Using AI Services
```typescript
import { generateTitleSuggestions } from '@/lib/ai'
const suggestions = await generateTitleSuggestions(content, category)
```

### Accessing Auth Context
```typescript
'use client'
import { useAuth } from '@/contexts/auth-context'
const { user, login, logout } = useAuth()
```

## Deployment

The project is configured for Vercel deployment:
- Automatic Prisma client generation via `postinstall` script
- Build command includes `prisma generate`
- Environment variables must be configured in Vercel dashboard
- NeonDB recommended for production PostgreSQL
