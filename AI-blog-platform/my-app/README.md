# AI Blog Platform

A modern, full-stack blog platform built with Next.js 15, featuring AI-assisted content creation, comprehensive user management, and a powerful admin dashboard.

## ✨ Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Blog Management**: Create, edit, publish, and manage blog posts with rich text editor
- **AI-Powered Content**: AI assistance for title suggestions, content improvement, SEO keywords, and summarization
- **Admin Dashboard**: Comprehensive admin panel for user and content management
- **Theme Support**: Light/Dark/System theme toggle with persistent preferences

### Technical Features
- **Next.js 15**: Latest App Router with TypeScript
- **Database**: PostgreSQL with Prisma ORM (supports local and NeonDB)
- **UI/UX**: Modern design with Tailwind CSS and shadcn/ui components
- **Authentication**: JWT tokens with secure middleware
- **Responsive Design**: Mobile-first responsive layout
- **Production Ready**: Optimized build with comprehensive error handling

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

### 🎯 First Steps

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
npm run db:setup          # Initialize database with sample data

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
- Follow the [NeonDB Setup Guide](./docs/neondb-setup.md)

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

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. **Push to Git repository** (GitHub, GitLab, or Bitbucket)
2. **Import project in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
3. **Configure environment variables** in Vercel dashboard
4. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all environment variables are set
2. **Database Connection**: Verify DATABASE_URL is correct
3. **AI Features Not Working**: Check GOOGLE_AI_API_KEY is valid
4. **Theme Toggle Not Showing**: Ensure Header component is imported in pages

### Recent Fixes

- ✅ Fixed theme toggle visibility in header
- ✅ Resolved Next.js 15 API route parameter types
- ✅ Fixed React Hook dependency warnings
- ✅ Optimized build process for production

## 🔒 Security Considerations

- **JWT Secret**: Use a strong, random string (32+ characters)
- **Environment Variables**: Never commit sensitive data to version control
- **Rate Limiting**: Consider implementing rate limiting for API endpoints
- **HTTPS**: Always use HTTPS in production
- **Dependencies**: Regularly update dependencies for security patches

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Prisma](https://prisma.io/) - Database ORM
- [Google AI](https://ai.google.dev/) - AI services
