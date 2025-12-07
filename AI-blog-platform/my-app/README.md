# AI Blog Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

A modern, full-stack AI-powered blog platform built with Next.js 16, featuring intelligent content creation, comprehensive user management, social media integration, and a powerful admin dashboard.

[Live Demo](https://aiblogify.vercel.app/) · [Report Bug](https://github.com/yourusername/ai-blog-platform/issues) · [Request Feature](https://github.com/yourusername/ai-blog-platform/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

AI Blog Platform is a production-ready, full-stack blogging solution that leverages the power of AI to enhance content creation. Built with modern web technologies, it offers a seamless writing experience with intelligent suggestions, comprehensive analytics, and a beautiful, responsive interface.

### Why AI Blog Platform?

- **AI-Powered Writing**: Get intelligent title suggestions, content improvements, SEO optimization, and summaries
- **Production Ready**: Built with enterprise-grade architecture and security best practices
- **Fully Responsive**: Optimized for all devices from mobile to desktop
- **Easy to Deploy**: One-click deployment to Vercel with automated CI/CD
- **Extensible**: Clean architecture with TypeScript for easy customization

---

## ✨ Features

### 🎨 Content Creation & Management

- **Rich Blog Editor**: Create and edit blog posts with a user-friendly interface
- **AI Assistant**:
  - Title suggestions based on content and category
  - Content improvement (grammar, clarity, engagement)
  - SEO keyword generation with meta descriptions
  - Automatic content summarization with key points
- **Draft & Publish**: Save drafts and publish when ready
- **Category & Tags**: Organize content with categories and custom tags
- **Read Time Estimation**: Automatic reading time calculation
- **Slug Generation**: SEO-friendly URL slugs

### 👥 User Management & Authentication

- **Secure Authentication**: JWT-based authentication with httpOnly cookies
- **Email Verification**: OTP-based email verification system
- **Role-Based Access**: USER and ADMIN roles with granular permissions
- **User Profiles**: Customizable user profiles with avatar initials
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Secure token refresh mechanism

### 🌐 Social & Community Features

- **Social Media Sharing**: Share posts on 8+ platforms:
  - Twitter/X
  - Facebook
  - WhatsApp
  - LinkedIn
  - Reddit
  - Telegram
  - Email
  - Copy Link (with clipboard API)
- **Community Stats Dashboard**:
  - Total posts and active authors
  - Recent activity feed
  - Top authors leaderboard
  - Average posts per author
- **Comment System**: Nested comments with user attribution
- **Blog Discovery**: Search by title, author, tags, or content

### 🎨 UI/UX Features

- **Theme System**: Light/Dark/System themes with smooth transitions
- **Fully Responsive**: Mobile-first design optimized for all screen sizes
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: Graceful error messages and fallbacks
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

### 🔐 Admin Dashboard

- **User Management**:
  - View all users with search and filters
  - Update user roles (USER/ADMIN)
  - Delete users (with cascade delete of posts/comments)
  - Email verification status
- **Post Management**:
  - View all posts across the platform
  - Edit or delete any post
  - Publish/unpublish posts
  - Category and status filters
- **Platform Settings**:
  - Configure site-wide settings
  - Manage categories
  - System health monitoring
- **Analytics**:
  - User growth statistics
  - Content creation trends
  - Engagement metrics

### 🚀 Technical Features

- **Next.js 16**: Latest App Router with Server Components
- **TypeScript**: Full type safety across the stack
- **Database**: PostgreSQL with Prisma ORM (local or serverless)
- **Edge Runtime**: Optimized middleware for global performance
- **Rate Limiting**: Configurable per environment
- **Security Headers**: CSP, X-Frame-Options, Referrer-Policy
- **SEO Optimized**: Meta tags, Open Graph, structured data
- **Performance**: Optimized builds with Turbopack
- **Testing**: Jest and React Testing Library setup

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React, React Icons
- **State Management**: React Context API
- **Forms**: React Hook Form (ready to integrate)

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL (local or NeonDB)
- **ORM**: Prisma 6.15.0
- **Authentication**: JWT (jose library for Edge runtime)
- **Password Hashing**: bcryptjs
- **Rate Limiting**: Custom middleware with in-memory store

### AI Integration
- **Provider**: Google Gemini AI API
- **Models**: gemini-1.5-flash (configurable)
- **Features**: Title generation, content improvement, SEO, summarization

### DevOps & Deployment
- **Hosting**: Vercel (recommended)
- **CI/CD**: Vercel automated deployments
- **Database**: NeonDB (serverless PostgreSQL)
- **Environment**: Edge Runtime for middleware

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Testing**: Jest + React Testing Library
- **Git Hooks**: Ready for Husky integration

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL database** (local or cloud)
- **Google AI API Key** ([Get it here](https://makersuite.google.com/app/apikey))
- (Optional) Vercel account for deployment

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-blog-platform.git
cd ai-blog-platform/my-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ai_blog_platform"

# For NeonDB (serverless PostgreSQL - recommended for production)
# DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Authentication Secrets (generate strong random strings)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
AUTH_SECRET="your-auth-secret-min-32-characters"
AUTH_ACCESS_SECRET="your-access-secret-min-32-characters"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-characters"

# Google AI API Key
GOOGLE_AI_API_KEY="your-google-gemini-api-key"
GEMINI_API_KEY="your-google-gemini-api-key"

# Optional: Email Service (for OTP verification)
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT="587"
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-app-password"
```

**Generate Strong Secrets:**
```bash
# On Linux/macOS
openssl rand -base64 32

# On Windows (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

4. **Initialize the database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database with sample data (optional)
npm run db:setup
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### 🎯 First Steps

1. **Create an account**:
   - Visit http://localhost:3000/auth
   - Register with your email and password
   - Verify your email with the OTP code (if email service is configured)

2. **Create your first post**:
   - Click "Write Post" button
   - Use the AI Assistant for title suggestions and content improvement
   - Add categories and tags
   - Save as draft or publish immediately

3. **Explore AI features**:
   - Try "Suggest Titles" based on your content
   - Use "Improve Content" for grammar, clarity, or engagement
   - Generate SEO keywords and meta descriptions
   - Create summaries with key points

4. **Access Admin Dashboard** (if you're an admin):
   - Visit http://localhost:3000/admin
   - Manage users, posts, and settings

---

## 📁 Project Structure

```
my-app/
├── app/                          # Next.js 16 App Router
│   ├── api/                      # API Routes (Server-Side)
│   │   ├── admin/                # Admin API endpoints
│   │   │   ├── posts/            # Post management
│   │   │   ├── users/            # User management
│   │   │   └── settings/         # Platform settings
│   │   ├── ai/                   # AI service endpoints
│   │   │   ├── suggest-titles/   # Title generation
│   │   │   ├── improve-content/  # Content improvement
│   │   │   ├── seo-keywords/     # SEO optimization
│   │   │   └── summarize/        # Content summarization
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── register/         # User registration
│   │   │   ├── login/            # User login
│   │   │   ├── verify-otp/       # Email verification
│   │   │   └── me/               # Current user info
│   │   ├── posts/                # Blog post CRUD
│   │   ├── community/            # Community stats
│   │   └── comments/             # Comment management
│   ├── admin/                    # Admin dashboard pages
│   │   └── page.tsx              # Admin panel UI
│   ├── auth/                     # Authentication pages
│   │   └── page.tsx              # Login/Register forms
│   ├── blog/                     # Blog management pages
│   │   └── page.tsx              # Blog list and viewer
│   ├── profile/                  # User profile pages
│   │   └── page.tsx              # Profile settings
│   ├── globals.css               # Global styles and Tailwind
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
│
├── components/                   # React Components
│   ├── admin/                    # Admin-specific components
│   │   ├── posts-table.tsx       # Post management table
│   │   ├── users-table.tsx       # User management table
│   │   └── admin-settings.tsx    # Settings panel
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # Login form
│   │   ├── register-form.tsx     # Registration form
│   │   ├── user-menu.tsx         # User dropdown menu
│   │   └── otp-verification.tsx  # OTP input
│   ├── layout/                   # Layout components
│   │   ├── header.tsx            # Main navigation
│   │   └── footer.tsx            # Footer
│   ├── landing/                  # Landing page sections
│   │   ├── hero.tsx              # Hero section
│   │   ├── features.tsx          # Features showcase
│   │   └── cta.tsx               # Call-to-action
│   ├── ui/                       # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── dialog.tsx            # Modal dialog
│   │   ├── input.tsx             # Input field
│   │   └── ...                   # Other UI components
│   ├── ai-assistant.tsx          # AI content generation interface
│   ├── blog-editor.tsx           # Rich blog post editor
│   ├── blog-list.tsx             # Blog post list with filters
│   ├── blog-viewer.tsx           # Blog post viewer
│   ├── share-buttons.tsx         # Social media sharing
│   ├── comment-section.tsx       # Comment system
│   ├── community-stats.tsx       # Community statistics
│   └── theme-toggle.tsx          # Theme switcher
│
├── contexts/                     # React Contexts
│   ├── auth-context.tsx          # Authentication state
│   └── theme-context.tsx         # Theme management
│
├── lib/                          # Utility Functions & Services
│   ├── ai.ts                     # Google Gemini AI integration
│   ├── auth.ts                   # Authentication utilities
│   ├── blog.ts                   # Blog post helpers
│   ├── db.ts                     # Prisma client instance
│   ├── jwt.ts                    # JWT token operations
│   ├── utils.ts                  # General utilities
│   └── middleware/               # Middleware utilities
│       ├── index.ts              # Rate limiting
│       └── db-connection.ts      # Database helpers
│
├── prisma/                       # Database Schema & Migrations
│   ├── schema.prisma             # Database models
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Database seeding
│
├── scripts/                      # Utility Scripts
│   ├── setup-db.ts               # Database initialization
│   └── create-admin.ts           # Admin user creation
│
├── __tests__/                    # Test Files
│   ├── components/               # Component tests
│   └── api/                      # API route tests
│
├── middleware.ts                 # Next.js Middleware (Edge Runtime)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── jest.config.ts                # Jest configuration
├── .env.example                  # Environment variables template
├── CLAUDE.md                     # Claude Code instructions
└── README.md                     # This file
```

---

## 🎨 Key Features

### 🤖 AI Assistant

The AI Assistant provides intelligent suggestions to enhance your content:

**Title Suggestions**
- Analyzes your content and category
- Generates 3-5 creative, SEO-friendly titles
- Provides reasoning for each suggestion
- One-click title selection

**Content Improvement**
- Grammar & Spelling fixes
- Clarity enhancement
- Engagement optimization
- Maintains your writing style

**SEO Optimization**
- Keyword extraction based on content
- Meta description generation
- Tag suggestions for better discoverability
- One-click tag application

**Content Summarization**
- Generates concise summaries
- Extracts key points
- Useful for excerpts and previews

### 🌐 Social Media Sharing

Share your posts across 8 major platforms with optimized share URLs:

- **Twitter/X**: Share with pre-filled tweet text
- **Facebook**: Share via Facebook's share dialog
- **WhatsApp**: Share directly to WhatsApp contacts
- **LinkedIn**: Professional network sharing
- **Reddit**: Submit to Reddit communities
- **Telegram**: Share via Telegram app/web
- **Email**: Share via default email client
- **Copy Link**: Copy to clipboard with visual feedback

All share buttons are:
- Fully responsive (icons on mobile, text on desktop)
- Secure (noopener, noreferrer attributes)
- Accessible (title tooltips)
- Optimized for each platform's API

### 📊 Community Stats

Real-time community metrics and engagement:

- **Total Posts**: All published content
- **Active Authors**: Unique content creators
- **Recent Activity**: Latest 5 posts with author info
- **Top Authors**: Leaderboard of most active writers
- **Average Posts**: Content creation rate per author

All stats are:
- Real-time updated
- Mobile responsive with truncation
- Cached for performance
- Linked to author profiles

### 🎨 Theme System

Customizable theme with persistent preferences:

- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for night writing
- **System Mode**: Automatic based on OS preference
- **Smooth Transitions**: Seamless theme switching
- **Persistent**: Saves preference to localStorage

### 🔒 Security Features

Enterprise-grade security implementation:

- **JWT Authentication**: Secure token-based auth
- **httpOnly Cookies**: XSS protection
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Security Headers**: CSP, X-Frame-Options, etc.
- **Edge Runtime**: Fast, globally distributed middleware
- **Input Validation**: Prevent SQL injection and XSS
- **Role-Based Access**: Granular permissions

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otpCode": "123456"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
```

---

### Blog Post Endpoints

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Blog Post",
  "content": "Post content here...",
  "excerpt": "Short description",
  "category": "Technology",
  "tags": ["AI", "Tech"],
  "status": "DRAFT"
}
```

#### Get All Published Posts
```http
GET /api/posts/published?category=Technology&search=AI
```

#### Get User's Posts
```http
GET /api/posts?status=DRAFT
Authorization: Bearer <token>
```

#### Update Post
```http
PATCH /api/posts/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "PUBLISHED"
}
```

#### Delete Post
```http
DELETE /api/posts/[id]
Authorization: Bearer <token>
```

---

### AI Endpoints

#### Generate Title Suggestions
```http
POST /api/ai/suggest-titles
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Your blog post content...",
  "category": "Technology"
}
```

Response:
```json
{
  "suggestions": [
    {
      "title": "The Future of AI in 2025",
      "reason": "Timely and SEO-friendly"
    }
  ]
}
```

#### Improve Content
```http
POST /api/ai/improve-content
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Your content...",
  "improvementType": "grammar" | "clarity" | "engagement"
}
```

#### Generate SEO Keywords
```http
POST /api/ai/seo-keywords
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Blog Title",
  "content": "Blog content...",
  "category": "Technology"
}
```

Response:
```json
{
  "keywords": ["AI", "machine learning", "technology"],
  "metaDescription": "Discover the latest trends in AI..."
}
```

#### Summarize Content
```http
POST /api/ai/summarize
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Long blog post content..."
}
```

---

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-token>
```

#### Update User Role
```http
PATCH /api/admin/users/[id]
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### Delete User
```http
DELETE /api/admin/users/[id]
Authorization: Bearer <admin-token>
```

#### Get All Posts (Admin)
```http
GET /api/admin/posts?status=PUBLISHED&category=Technology
Authorization: Bearer <admin-token>
```

---

### Community Endpoints

#### Get Community Stats
```http
GET /api/community/stats
```

Response:
```json
{
  "totalPosts": 42,
  "totalAuthors": 12,
  "recentPosts": [...],
  "topAuthors": [...]
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to Git repository**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ai-blog-platform.git
git push -u origin main
```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

In Vercel dashboard, add these environment variables:

```env
DATABASE_URL=your-neondb-connection-string
JWT_SECRET=your-production-jwt-secret
AUTH_SECRET=your-production-auth-secret
AUTH_ACCESS_SECRET=your-production-access-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
GOOGLE_AI_API_KEY=your-google-ai-api-key
GEMINI_API_KEY=your-google-ai-api-key
```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Future pushes to `main` will auto-deploy

### Manual Deployment

1. **Build for production**
```bash
npm run build
```

2. **Start production server**
```bash
npm run start
```

3. **Deploy to your server**
   - Use PM2 or similar process manager
   - Configure reverse proxy (Nginx/Apache)
   - Set up SSL certificate

### Database Setup (NeonDB)

1. **Create NeonDB account** at [neon.tech](https://neon.tech)

2. **Create new project**
   - Choose your region
   - Select PostgreSQL version

3. **Copy connection string**
   - Click "Connection String"
   - Use the pooled connection for serverless

4. **Update DATABASE_URL**
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

5. **Run migrations**
```bash
npm run prisma:migrate
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run db:setup         # Initialize with sample data

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Utilities
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
```

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/my-feature
```

2. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

3. **Run tests and linting**
```bash
npm run lint
npm run test
npm run type-check
```

4. **Commit your changes**
```bash
git add .
git commit -m "Add my feature"
```

5. **Push and create PR**
```bash
git push origin feature/my-feature
```

### Code Style Guidelines

- **TypeScript**: Use strict mode, avoid `any`
- **Components**: Use functional components with hooks
- **Naming**:
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
- **File structure**: Group by feature, not by type
- **Comments**: Use JSDoc for public APIs

---

## 🐛 Troubleshooting

### Common Issues

#### Build Errors

**Error**: `Module not found: Can't resolve '@/...'`

**Solution**: Check `tsconfig.json` has correct path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

#### Database Connection

**Error**: `Can't reach database server`

**Solution**:
- Check DATABASE_URL is correct
- Ensure database is running (for local PostgreSQL)
- Check firewall rules (for cloud databases)
- For NeonDB, ensure SSL is required: `?sslmode=require`

---

#### Middleware Errors

**Error**: `MIDDLEWARE_INVOCATION_FAILED`

**Solution**:
- Middleware runs in Edge runtime (no Node.js APIs)
- Don't import Prisma in middleware
- Use `jose` for JWT operations (not `jsonwebtoken`)
- Check middleware.ts has proper error handling

---

#### AI Features Not Working

**Error**: `AI request failed` or `API key invalid`

**Solution**:
- Verify `GOOGLE_AI_API_KEY` is set correctly
- Check API key has Gemini API enabled
- Ensure you have API quota remaining
- Check network connectivity

---

#### Theme Toggle Issues

**Error**: Theme doesn't persist or flashes on load

**Solution**:
- Ensure ThemeProvider wraps the app in layout.tsx
- Check localStorage is accessible
- Verify theme-toggle.tsx is imported in header
- Clear browser cache and cookies

---

#### Email Verification

**Error**: OTP emails not sending

**Solution**:
- If using Gmail, enable "App Passwords"
- Check SMTP credentials in .env
- Verify firewall allows SMTP port (587)
- Check spam folder
- For development, log OTP to console instead

---

### Performance Optimization

1. **Slow page loads**
   - Enable Next.js Image optimization
   - Use dynamic imports for heavy components
   - Implement lazy loading
   - Check database query performance

2. **Large bundle size**
   - Analyze bundle: `npm run build -- --profile`
   - Remove unused dependencies
   - Use dynamic imports
   - Optimize images

3. **Database performance**
   - Add database indexes
   - Use Prisma connection pooling
   - Implement caching (Redis)
   - Optimize queries with `include` and `select`

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Contribution Process

1. **Fork the repository**

2. **Clone your fork**
```bash
git clone https://github.com/yourusername/ai-blog-platform.git
cd ai-blog-platform/my-app
```

3. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

4. **Make your changes**
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation

5. **Commit with conventional commits**
```bash
git commit -m "feat: add amazing feature"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

6. **Push to your fork**
```bash
git push origin feature/amazing-feature
```

7. **Open a Pull Request**
   - Describe your changes
   - Link related issues
   - Wait for review

### Development Setup

See [Installation](#installation) section above.

### Reporting Bugs

Use GitHub Issues with the bug report template:
- Describe the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Environment details

### Feature Requests

Use GitHub Issues with the feature request template:
- Clear description
- Use case / motivation
- Proposed solution
- Alternative solutions considered

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 AI Blog Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

This project is built with amazing open-source technologies:

- **[Next.js](https://nextjs.org/)** - The React Framework for Production
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Prisma](https://prisma.io/)** - Next-generation ORM
- **[Google Gemini AI](https://ai.google.dev/)** - AI-powered content generation
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform
- **[NeonDB](https://neon.tech/)** - Serverless PostgreSQL
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible components
- **[Lucide](https://lucide.dev/)** - Beautiful icon library
- **[jose](https://github.com/panva/jose)** - JWT operations for Edge runtime

---

## 📧 Support

- **Documentation**: Read this README and [CLAUDE.md](CLAUDE.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-blog-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-blog-platform/discussions)
- **Email**: support@aiblogplatform.com

---

## 🗺️ Roadmap

### Planned Features

- [ ] Rich text editor with WYSIWYG
- [ ] Image upload and management
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] Email notifications for comments
- [ ] Social login (Google, GitHub)
- [ ] Export posts to Markdown/PDF
- [ ] SEO sitemap generation
- [ ] RSS feed support
- [ ] GraphQL API
- [ ] Mobile app (React Native)

### Completed Features

- [x] AI-powered content generation
- [x] Social media sharing (8 platforms)
- [x] Community stats dashboard
- [x] Fully responsive design
- [x] Email verification with OTP
- [x] Comment system
- [x] Admin dashboard
- [x] Theme system (light/dark)
- [x] Role-based access control
- [x] Rate limiting
- [x] Production deployment

---

<div align="center">

**Made with ❤️ by the AI Blog Platform**

[⬆ Back to Top](#ai-blog-platform)

</div>
