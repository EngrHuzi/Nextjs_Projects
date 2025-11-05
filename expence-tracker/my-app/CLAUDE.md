# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an expense tracker application built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. The project uses the Next.js App Router architecture.

## Common Commands

### Development
```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Create production build
npm start            # Start production server
npm run lint         # Run ESLint for code linting
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: ES2017 target with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui (copy-paste components based on Radix UI)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts (SVG-based, accessible)
- **Fonts**: Geist Sans and Geist Mono (loaded via next/font/google)
- **Linting**: ESLint 9 with next-config rules

### Backend
- **Database**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma (type-safe database client)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Email**: Resend API
- **AI/ML**: TensorFlow.js (client-side category suggestions)

### Deployment
- **Hosting**: Vercel (free tier)
- **CI/CD**: Automatic deployments from Git
- **Database**: Supabase (500MB free tier)

## Project Structure

```
my-app/
├── app/                 # App Router directory
│   ├── layout.tsx      # Root layout with font configuration
│   ├── page.tsx        # Home page component
│   └── globals.css     # Global styles with Tailwind imports
├── public/             # Static assets
├── next.config.ts      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
├── eslint.config.mjs   # ESLint configuration (flat config)
└── postcss.config.mjs  # PostCSS configuration for Tailwind
```

## Architecture Notes

### Data Architecture
- **Database**: PostgreSQL with Prisma ORM
- **Schema Location**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/` (versioned, tracked in Git)
- **Core Entities**: User, Transaction, Category, Budget, SyncQueueItem
- **Decimal Precision**: Use Prisma `Decimal` type and `decimal.js` for financial calculations
- **Data Isolation**: Row-level security (all queries filter by userId)
- **Validation**: Zod schemas shared between client and server

**Database Commands:**
```bash
npx prisma init                    # Initialize Prisma
npx prisma migrate dev             # Create and apply migration
npx prisma migrate deploy          # Apply migrations to production
npx prisma generate                # Generate Prisma Client
npx prisma db seed                 # Run seed script
npx prisma studio                  # Open database GUI
```

### TypeScript Configuration
- Path aliases: `@/*` maps to root directory
- JSX runtime: react-jsx (automatic React import)
- Module resolution: bundler mode for Next.js compatibility
- Strict mode enabled for type safety

### Styling System
- **Tailwind CSS v4**: Uses new `@import "tailwindcss"` syntax in globals.css
- **CSS Variables**: Custom properties defined in `:root` for background/foreground colors
- **Theme System**: Inline theme configuration using `@theme inline` directive
- **Dark Mode**: Automatic dark mode support via `prefers-color-scheme`
- **Fonts**: Geist Sans (sans-serif) and Geist Mono (monospace) configured as CSS variables

### ESLint Configuration
- Uses new ESLint flat config format (eslint.config.mjs)
- Extends next/core-web-vitals and next/typescript presets
- Global ignores: .next/, out/, build/, next-env.d.ts

## Development Guidelines

### Component Development
- All components should be TypeScript (.tsx) files
- Use Server Components by default (App Router convention)
- Add 'use client' directive only when client-side features are needed
- Follow Next.js 16 conventions for metadata, layouts, and pages

### Styling Conventions
- Use Tailwind CSS utility classes for styling
- Leverage CSS variables (--background, --foreground) for theming
- Use font variables (--font-geist-sans, --font-geist-mono) for typography
- Ensure dark mode support via Tailwind's dark: modifier

### Type Safety
- Enable strict TypeScript checking
- Define proper types for component props
- Use Next.js type imports (Metadata, NextConfig, etc.)

### File Organization
- Page components go in app/ directory following App Router conventions
- Use route groups with (folder) syntax when needed
- Shared components can be organized in app/components/ or a separate components/ directory
- API routes go in app/api/ directory

## Next.js 16 Specific Features

- **App Router**: Use app/ directory for all routes and layouts
- **React Server Components**: Default component type
- **Image Optimization**: Use next/image for all images
- **Font Optimization**: Fonts are automatically optimized via next/font/google
- **Metadata API**: Define metadata in layout.tsx and page.tsx files
