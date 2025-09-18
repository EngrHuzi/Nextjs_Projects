# AI Blog Platform – Full Documentation

## Overview

A modern, full-stack blog platform built with Next.js 15, featuring AI-assisted content creation, robust user management, and a powerful admin dashboard. The platform is designed for extensibility, security, and a seamless user experience.

---

## ✨ Features

### Core Functionality

- **User Authentication**: Secure JWT-based authentication with role-based access control.
- **Blog Management**: Create, edit, publish, and manage blog posts with a rich text editor.
- **AI-Powered Content**: AI assistance for title suggestions, content improvement, SEO keywords, and summarization.
- **Admin Dashboard**: Comprehensive admin panel for user and content management.
- **Theme Support**: Light/Dark/System theme toggle with persistent preferences.

### Technical Features

- **Next.js 15**: Latest App Router with TypeScript.
- **Database**: PostgreSQL with Prisma ORM (supports local and NeonDB).
- **UI/UX**: Modern design with Tailwind CSS and shadcn/ui components.
- **Authentication**: JWT tokens with secure middleware.
- **Responsive Design**: Mobile-first responsive layout.
- **Production Ready**: Optimized build with comprehensive error handling.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL database** (local or NeonDB)
- **Google AI API Key** (for AI features)
- (Optional) Vercel account for deployment

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_blog_platform"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# AI Services
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Optional: NeonDB (if using serverless PostgreSQL)
NEON_DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-blog-platform/my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create `.env` file with the variables shown above
   - Get your Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Initialize the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # Set up initial data
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at **http://localhost:3000**

### First Steps

1. **Create an admin user** (if not already created):
   ```bash
   npm run create-admin-user
   ```

2. **Access the application**:
   - Visit http://localhost:3000
   - Register a new account or login with admin credentials
   - Explore the blog creation features and AI assistance

3. **Admin Dashboard**:
   - Login as admin to access `/admin`
   - Manage users, posts, and platform settings

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
npm run db:setup           # Initialize database with sample data

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
```

### Database Options

#### Local PostgreSQL

- Install PostgreSQL locally
- Create a database named `ai_blog_platform`
- Update `DATABASE_URL` in `.env`

#### NeonDB (Recommended for Production)

- Sign up at [NeonDB](https://neon.tech)
- Create a new project
- Copy the connection string to `DATABASE_URL`
- Follow the NeonDB Setup Guide below

---

## 📁 Project Structure

```
my-app/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   ├── ai/                   # AI service endpoints
│   │   └── auth/                 # Authentication endpoints
│   ├── admin/                    # Admin dashboard pages
│   ├── auth/                     # Authentication pages
│   ├── blog/                     # Blog management pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   ├── auth/                     # Authentication components
│   ├── layout/                   # Layout components (Header, Footer)
│   ├── landing/                  # Landing page components
│   └── ui/                       # Reusable UI components (shadcn/ui)
├── contexts/                     # React contexts
│   ├── auth-context.tsx          # Authentication state
│   └── theme-context.tsx         # Theme management
├── lib/                          # Utility functions and services
│   ├── ai.ts                     # AI service integration
│   ├── auth.ts                   # Authentication utilities
│   ├── blog.ts                   # Blog post management
│   ├── db.ts                     # Database connection
│   └── utils.ts                  # General utilities
├── prisma/                       # Database schema and migrations
├── scripts/                      # Utility scripts
├── docs/                         # Documentation
└── __tests__/                    # Test files
```

---

## 🎨 Key Features

### Theme System

- **Light/Dark/System themes** with persistent user preferences
- **Theme toggle** in header (top-right corner)
- **Automatic system theme detection**
- **Smooth theme transitions**

### AI Integration

- **Title Suggestions**: AI-powered blog post title generation
- **Content Improvement**: AI assistance for content enhancement
- **SEO Keywords**: Automatic SEO keyword suggestions
- **Content Summarization**: AI-generated post summaries

### Admin Dashboard

- **User Management**: View, edit, and delete users
- **Post Management**: Manage all blog posts
- **Platform Settings**: Configure site-wide settings
- **Analytics**: Basic usage statistics

---

## 🛡️ Admin Dashboard

The admin dashboard provides comprehensive management capabilities for the AI Blog Platform. It allows administrators to manage users, posts, and platform settings.

- Accessible at `/admin` (admin role required)
- Tabs for statistics, user management, post management, and platform settings
- All admin API endpoints require a valid JWT and ADMIN role

### Features

1. **Overview Dashboard**
   - Statistics: View total users, posts, published posts, and draft posts
   - Content Performance: See publish rate and content statistics
   - Quick Actions: Direct links to common tasks

2. **User Management**
   - View all registered users with their details
   - Search by name/email and filter by role
   - Change user roles between ADMIN and USER
   - Remove users from the platform

3. **Post Management**
   - View all blog posts with detailed information
   - Search by title/content/author and filter by status/category
   - Publish/unpublish posts
   - Remove posts from the platform
   - Direct links to view and edit posts

4. **Platform Settings**
   - Site name, description, URL, admin email, theme
   - Registration settings, email verification, post limits
   - Comment settings, AI features
   - Maintenance Mode: Temporarily disable public access

### API Endpoints

#### Users
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/[id]` - Update user role
- `DELETE /api/admin/users/[id]` - Delete user

#### Posts
- `GET /api/admin/posts` - Get all posts
- `PATCH /api/admin/posts/[id]` - Update post status
- `DELETE /api/admin/posts/[id]` - Delete post

#### Settings
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings

### Authentication

All admin API endpoints require:
- Valid JWT token in Authorization header
- User must have ADMIN role

### Security

- All admin operations are protected by authentication middleware
- Role-based access control ensures only admins can access admin features
- Sensitive user data (passwords) are never exposed in API responses

### Usage

1. **Login** as an admin user
2. **Navigate** to `/admin` or click the "Admin" link in the header
3. **Use the tabs** to switch between different management sections
4. **Search and filter** data as needed
5. **Perform actions** using the action buttons and dropdowns

### Default Admin User

For testing purposes, you can use:
- **Email**: muhammadhuzaifaai890@gmail.com
- **Password**: (use the password you set during registration)

Or create a new admin user using the script:
```bash
npx tsx scripts/create-admin-user.ts
```

### Troubleshooting

- **Access Denied**: Ensure you're logged in with an admin account
- **API Errors**: Check browser console for detailed error messages
- **Data Not Loading**: Verify authentication token is valid
- **Permission Errors**: Ensure user has ADMIN role

---

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### AI Endpoints

- `POST /api/ai/suggest-titles` - Generate title suggestions
- `POST /api/ai/improve-content` - Improve content with AI
- `POST /api/ai/seo-keywords` - Generate SEO keywords
- `POST /api/ai/summarize` - Summarize content

### Admin Endpoints

- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/[id]` - Update user role
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/posts` - Get all posts
- `PATCH /api/admin/posts/[id]` - Update post status
- `DELETE /api/admin/posts/[id]` - Delete post

---

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Push to Git repository (GitHub, GitLab, or Bitbucket)
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy – Vercel will automatically build and deploy

### Environment Variables for Production

```env
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

---

## 🗄️ NeonDB Setup Guide

NeonDB is a serverless PostgreSQL service with a generous free tier. It provides:
- Serverless PostgreSQL database
- Automatic scaling
- Branching for development and testing
- Built-in connection pooling
- Web-based SQL editor

### Setup Instructions

1. **Create a NeonDB Account**
   - Go to [NeonDB's website](https://neon.tech) and sign up for an account
   - Verify your email address

2. **Create a New Project**
   - From the NeonDB dashboard, click "New Project"
   - Give your project a name (e.g., "ai-blog-platform")
   - Select a region closest to your users
   - Click "Create Project"

3. **Get Your Connection String**
   - Once your project is created, you'll see a connection string in the format:
     ```
     postgresql://[user]:[password]@[hostname]/[dbname]?sslmode=require
     ```
   - Copy this connection string

4. **Update Your Environment Variables**
   - Open your `.env` file in the project root
   - Replace the `DATABASE_URL` value with your NeonDB connection string:
     ```
     DATABASE_URL="postgresql://[user]:[password]@[hostname]/[dbname]?sslmode=require"
     ```

5. **Run Prisma Migrations**
   - Run the following command to apply your database schema to NeonDB:
     ```bash
     npm run prisma:migrate
     ```

6. **Verify Connection**
   - Run the setup verification script to ensure your application can connect to NeonDB:
     ```bash
     npm run db:setup-neon
     ```
   - If successful, you should see a message confirming the connection to NeonDB.

### Troubleshooting

- **Connection Issues**
  - Ensure your connection string is correctly formatted
  - Check that you've enabled the correct IP addresses in NeonDB's access control settings
  - Verify that you're using `sslmode=require` in your connection string

- **Migration Issues**
  - If migrations fail, check the Prisma error messages for details
  - Ensure your database user has the necessary permissions
  - Try running `npx prisma migrate reset` to reset the database and apply migrations from scratch

### Additional Resources

- [NeonDB Documentation](https://neon.tech/docs)
- [Prisma with PostgreSQL Guide](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases/connect-your-database-typescript-postgresql)

---

## 🔧 Troubleshooting

- **Build Errors**: Ensure all environment variables are set
- **Database Connection**: Verify `DATABASE_URL` is correct
- **AI Features Not Working**: Check `GOOGLE_AI_API_KEY` is valid
- **Theme Toggle Not Showing**: Ensure Header component is imported in pages

---

## 🔒 Security Considerations

- Use a strong, random JWT secret (32+ characters)
- Never commit sensitive data to version control
- Consider implementing rate limiting for API endpoints
- Always use HTTPS in production
- Regularly update dependencies for security patches

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) – React framework
- [Tailwind CSS](https://tailwindcss.com/) – CSS framework
- [shadcn/ui](https://ui.shadcn.com/) – UI components
- [Prisma](https://prisma.io/) – Database ORM
- [Google AI](https://ai.google.dev/) – AI services
