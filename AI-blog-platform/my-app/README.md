# AI Blog Platform

A modern blog platform built with Next.js, featuring AI-assisted content creation, user authentication, and an admin dashboard.

## Features

- User authentication with JWT
- Role-based access control (admin/user)
- Blog post creation and management
- AI-assisted content generation
- Responsive design with Tailwind CSS
- PostgreSQL database (local or NeonDB) with Prisma ORM
- NeonDB serverless PostgreSQL integration

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- (Optional) Vercel account for deployment

## Getting Started

### Environment Setup

1. Clone the repository
2. Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

3. Update the following variables in your `.env` file:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth

### Installation

```bash
npm install
```

### Database Setup

#### Local PostgreSQL

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

#### NeonDB (Serverless PostgreSQL)

For using NeonDB as your database:

1. Follow the setup instructions in [NeonDB Setup Guide](./docs/neondb-setup.md)
2. Run the verification script:

```bash
npm run db:setup-neon
```

# Set up the database with initial data
npm run db:setup

# (Optional) Migrate existing users from JSON to database
npm run db:migrate-users
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Testing

```bash
npm run test
```

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard pages
│   ├── auth/             # Authentication pages
│   ├── blog/             # Blog pages
│   └── page.tsx          # Home page
├── components/           # React components
├── contexts/             # React contexts
├── lib/                  # Utility functions and services
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── scripts/              # Utility scripts
└── __tests__/            # Test files
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

The easiest way to deploy this application is using Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy

## Security Considerations

- The JWT secret should be a strong, random string
- In production, consider using HTTP-only cookies instead of localStorage for token storage
- Regularly update dependencies to patch security vulnerabilities
- Implement rate limiting for authentication endpoints

## License

MIT
