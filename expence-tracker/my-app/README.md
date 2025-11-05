# Expense Tracker MVP

A modern, privacy-first expense tracking application built with Next.js 16, React 19, and TypeScript. Track your expenses and income, manage budgets, visualize spending patterns, and get AI-powered category suggestions - all while keeping your data secure and private.

## Features

- **User Authentication**: Secure registration, login, and password reset with NextAuth.js
- **Transaction Management**: Add, edit, delete, and filter expenses and income
- **Category Management**: 14 predefined categories + custom categories
- **Budget Tracking**: Set monthly budgets with 90% and 100% threshold alerts
- **Dashboard & Charts**: Visualize spending with pie charts, bar charts, and trend lines
- **Data Portability**: Export to CSV/PDF, import from CSV
- **AI Categorization**: Smart category suggestions based on transaction descriptions
- **Notification Preferences**: Customize budget alerts and reminders
- **Privacy-First**: No third-party tracking, all data stays with you

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel (recommended)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted on Supabase)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd my-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend API)
RESEND_API_KEY="your-resend-api-key" # Get from https://resend.com
```

**Note**: Email functionality is stubbed for MVP. You can leave `RESEND_API_KEY` empty for development.

### 4. Setup Database

#### Option A: Local PostgreSQL

```bash
# Start PostgreSQL server
# Create database
createdb expense_tracker

# Run Prisma migrations
npx prisma migrate dev

# Seed predefined categories
npx prisma db seed
```

#### Option B: Supabase (Hosted PostgreSQL)

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings → Database
4. Update `DATABASE_URL` in `.env`
5. Run migrations:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev --name <name>  # Create new migration
```

## Project Structure

```
my-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register, etc.)
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── error.tsx            # Global error boundary
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard-specific components
│   ├── transactions/        # Transaction components
│   └── charts/              # Chart components
├── lib/                     # Utility functions
│   ├── api/                 # API utilities
│   ├── auth/                # Authentication utilities
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # Business logic services
│   └── utils/               # General utilities
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed script
└── public/                  # Static assets
```

## Database Schema

The application uses 5 main entities:

- **User**: User accounts with authentication and preferences
- **Transaction**: Expenses and income records
- **Category**: Predefined and custom categories
- **Budget**: Monthly budget tracking per category
- **SyncQueueItem**: Offline sync queue (future feature)

See `prisma/schema.prisma` for the complete schema.

## Security Features

- Password hashing with bcrypt (cost factor 12)
- JWT tokens in HTTP-only cookies
- CSRF protection via NextAuth.js
- SQL injection prevention via Prisma parameterized queries
- XSS prevention via React's built-in escaping
- Security headers (CSP, HSTS, X-Frame-Options)
- Rate limiting on authentication endpoints (planned)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Build the Next.js app
- Set up preview deployments for PRs
- Configure custom domains (if desired)

### Database Migrations in Production

```bash
# Connect to production database
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

## Environment Variables

See `.env.example` for all available environment variables with descriptions.

## Contributing

This is an MVP project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Receipt scanning (OCR)
- [ ] Bank integration via Plaid
- [ ] Shared budgets for families
- [ ] Tax reporting features
- [ ] Investment tracking

---

Built with ❤️ using Next.js and TypeScript
