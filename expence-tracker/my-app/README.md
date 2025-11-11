# Expense Tracker

A modern, privacy-first expense tracking application built with Next.js 16, React 19, and TypeScript. Track your expenses and income, manage budgets, visualize spending patterns, and get AI-powered category suggestions - all while keeping your data secure and private.

🚀 **Live Demo**: [https://myfinetracker.vercel.app](https://myfinetracker.vercel.app)

## ✨ Features

### Authentication & Security
- **Secure Registration & Login**: Email/password authentication with NextAuth.js v5
- **Email Verification**: OTP-based email verification system
- **Password Recovery**: Secure password reset flow with OTP verification
- **Session Management**: JWT-based sessions with HTTP-only cookies
- **Rate Limiting**: OTP attempt limits and resend cooldowns

### Financial Management
- **Transaction Management**: Add, edit, delete, and filter expenses and income
- **Category Management**: 14 predefined categories + custom categories
- **Budget Tracking**: Set monthly budgets with 90% and 100% threshold alerts
- **Dashboard & Charts**: Visualize spending with pie charts, bar charts, and trend lines
- **Data Portability**: Export to CSV/PDF, import from CSV
- **AI Categorization**: Smart category suggestions using TensorFlow.js

### User Experience
- **Dark Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Instant UI feedback for all actions
- **Notification Preferences**: Customize budget alerts and reminders
- **Privacy-First**: No third-party tracking, all data stays with you

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.1 (App Router) + React 19
- **Language**: TypeScript 5+ with strict mode
- **Styling**: Tailwind CSS v4 + shadcn/ui components (Radix UI)
- **Charts**: Recharts (SVG-based, accessible)
- **Forms**: React Hook Form + Zod validation
- **AI/ML**: TensorFlow.js (client-side category suggestions)
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL (Supabase recommended)
- **ORM**: Prisma 6+ with type-safe queries
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Email**: Resend API for transactional emails
- **Password Hashing**: bcrypt (cost factor 12)

### Deployment & DevOps
- **Hosting**: Vercel (optimized for Next.js)
- **CI/CD**: Automatic deployments from Git
- **Edge Runtime**: Middleware for authentication checks
- **Database Hosting**: Supabase (500MB free tier)

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

# NextAuth.js v5 Authentication
AUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000" # Your app URL



# App Configuration
NEXT_PUBLIC_APP_NAME="Expense Tracker"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Important Notes**:
- **AUTH_SECRET**: Required for NextAuth.js JWT signing. Generate a secure random string.
- **RESEND_API_KEY**: Required for OTP email verification and password reset emails. Sign up at [resend.com](https://resend.com) for a free API key.
- **DATABASE_URL**: Must point to a valid PostgreSQL database (local or hosted).

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

## 📁 Project Structure

```
my-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register, verify-email, etc.)
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── verify-email/    # OTP verification page
│   │   ├── forgot-password/ # Password recovery
│   │   └── reset-password/  # Password reset with OTP
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── transactions/    # Transaction management
│   │   ├── categories/      # Category management
│   │   ├── budgets/         # Budget tracking
│   │   ├── settings/        # User preferences
│   │   └── layout.tsx       # Dashboard layout with navigation
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   │   ├── [...nextauth]/  # NextAuth.js handlers
│   │   │   ├── register/    # User registration
│   │   │   ├── verify-otp/  # OTP verification
│   │   │   ├── resend-otp/  # Resend OTP
│   │   │   ├── forgot-password/ # Initiate password reset
│   │   │   └── reset-password/  # Complete password reset
│   │   ├── transactions/    # Transaction CRUD
│   │   ├── categories/      # Category CRUD
│   │   ├── budgets/         # Budget CRUD
│   │   ├── dashboard/       # Dashboard data endpoints
│   │   ├── export/          # CSV/PDF export
│   │   ├── import/          # CSV import
│   │   └── suggestions/     # AI category suggestions
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components (Button, Input, etc.)
│   ├── layout/              # Layout components (Header, Sidebar)
│   ├── providers/           # Context providers (Theme, etc.)
│   ├── dashboard/           # Dashboard-specific components
│   ├── transactions/        # Transaction components
│   ├── budgets/             # Budget components
│   └── charts/              # Chart components (Recharts)
├── lib/                     # Utility functions
│   ├── api/                 # API utilities & error handlers
│   ├── auth/                # Authentication utilities
│   │   ├── auth.ts          # NextAuth.js configuration
│   │   ├── otp.ts           # OTP generation & verification
│   │   └── password.ts      # Password hashing utilities
│   ├── email/               # Email service (Resend integration)
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # Business logic services
│   ├── utils/               # General utilities
│   └── prisma.ts            # Prisma client singleton
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Prisma schema
│   ├── migrations/          # Database migrations (versioned)
│   └── seed.ts              # Seed script (predefined categories)
├── middleware.ts            # Edge middleware for auth protection
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

## 🔒 Security Features

- **Password Security**: bcrypt hashing with cost factor 12
- **Session Management**: JWT tokens in HTTP-only cookies
- **CSRF Protection**: Built-in via NextAuth.js
- **Email Verification**: Mandatory OTP verification for new accounts
- **Password Recovery**: Secure OTP-based password reset flow
- **OTP Security**:
  - 6-digit numeric codes
  - 10-minute expiration
  - 5-attempt limit before lockout
  - 1-minute resend cooldown
- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Prevention**: React's built-in escaping + Content Security Policy
- **Edge Middleware**: Lightweight authentication checks (< 1MB)
- **Secure Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Input Validation**: Zod schemas on both client and server

## 🚀 Deployment

**Production Deployment**: [https://myfinetracker.vercel.app](https://myfinetracker.vercel.app)

### Deploy to Vercel (Recommended)

#### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `my-app` directory as the root

3. **Configure Environment Variables**
   Add these in Vercel dashboard (Settings → Environment Variables):
   ```
   DATABASE_URL=your-production-postgres-url
   AUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-app.vercel.app

   ```

4. **Deploy!** Vercel will automatically build and deploy

#### Important: Middleware Optimization

The middleware has been optimized to stay under Vercel's 1MB edge function limit by:
- Using `getToken` from `next-auth/jwt` instead of the full `auth` object
- Avoiding bundling Prisma client and adapters into the edge runtime
- Keeping only essential authentication logic

If you encounter size limit errors, ensure you're not importing heavy dependencies in `middleware.ts`.

### Database Migrations in Production

Run migrations before deploying code changes:

```bash
# Set production database URL
export DATABASE_URL="your-production-database-url"

# Apply migrations
npx prisma migrate deploy

# Verify with Prisma Studio
npx prisma studio
```

### Post-Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] Database migrations applied
- [ ] Seed data loaded (predefined categories)
- [ ] Email service configured and tested
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Test authentication flow (register, verify, login)
- [ ] Test OTP email delivery

### Troubleshooting Deployment Issues

**Middleware size error**: Ensure you're using the optimized middleware with `getToken` instead of the full `auth` import.

**Database connection errors**: Verify `DATABASE_URL` is correct and database is accessible from Vercel's edge network.

**Email not sending**: Check `RESEND_API_KEY` is valid and `RESEND_FROM_EMAIL` is verified in Resend dashboard.

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | Yes | JWT signing secret (32+ chars) | Generated via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Your app's URL | `http://localhost:3000` or `https://app.com` |
| `RESEND_FROM_EMAIL` | Yes | Verified sender email | `noreply@yourdomain.com` |
| `NEXT_PUBLIC_APP_NAME` | No | App name in emails | `Expense Tracker` |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL | Same as `NEXTAUTH_URL` |

**Security Note**: Never commit `.env` files to version control. Use `.env.example` as a template.

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

## 🗺️ Roadmap

### Phase 1 (Current - MVP) ✅
- [x] User authentication with email verification
- [x] Transaction management (CRUD)
- [x] Category management (predefined + custom)
- [x] Budget tracking with alerts
- [x] Dashboard with charts
- [x] CSV/PDF export
- [x] AI category suggestions
- [x] Dark mode support

### Phase 2 (Planned)
- [ ] Recurring transactions (auto-create monthly expenses)
- [ ] Multi-currency support with live exchange rates
- [ ] Receipt scanning (OCR with file upload)
- [ ] Mobile app (React Native with shared API)
- [ ] Notification system (email + push)
- [ ] Advanced filtering and search
- [ ] Custom date ranges for reports

### Phase 3 (Future)
- [ ] Bank integration via Plaid/Teller
- [ ] Shared budgets for families/teams
- [ ] Tax reporting features (categorize for taxes)
- [ ] Investment tracking
- [ ] Bill reminders and payment tracking
- [ ] Financial goals and savings targets
- [ ] API access for third-party integrations

## 📝 Recent Updates

### v1.1.0 (Latest)
- ✨ Added OTP-based email verification system
- 🔒 Implemented secure password reset flow with OTP
- ⚡ Optimized middleware to reduce bundle size (< 1MB for Vercel)
- 🎨 Added dark mode with theme provider
- 🐛 Fixed TypeScript errors in Zod error handling
- 📧 Integrated Resend API for transactional emails

### v1.0.0 (Initial Release)
- 🎉 Initial MVP release
- 💰 Core expense tracking functionality
- 📊 Dashboard with visualizations
- 🔐 NextAuth.js authentication

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code passes TypeScript checks (`npm run build`)
- Follow existing code style and conventions
- Update documentation for new features

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/expense-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/expense-tracker/discussions)
- **Email**: engineerhuzi@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [shadcn/ui](https://ui.shadcn.com) - Beautiful component library
- [Prisma](https://prisma.io) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org) - Authentication for Next.js
- [Vercel](https://vercel.com) - Deployment platform
- [Supabase](https://supabase.com) - PostgreSQL hosting


---

**Built with ❤️ using Next.js 16, React 19, and TypeScript**

🌐 [Live Demo](https://myfinetracker.vercel.app) | [GitHub](https://github.com/EngrHuzi) | Made by EngrHuzi
