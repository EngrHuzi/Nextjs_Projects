import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'
import { rateLimit, getRateLimitIdentifier } from '@/lib/middleware'

// Paths that require authentication
const protectedPaths = [
  '/admin',
  '/api/admin',
]

// Paths that are accessible without authentication
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/community',
  '/api/posts/published',
  '/blog',
  '/',
  '/login',
  '/register',
]

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Rate limiting for auth and admin routes (more lenient in development)
    if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/admin/')) {
      const identifier = getRateLimitIdentifier(request)
      const isAuthRoute = pathname.startsWith('/api/auth/')
      const isDevelopment = process.env.NODE_ENV === 'development'

      // Skip rate limiting for registration in development to avoid issues
      if (isDevelopment && pathname === '/api/auth/register') {
        // Skip rate limiting for registration in development
      } else {
        // More lenient limits for development
        const limit = isDevelopment
          ? (isAuthRoute ? 50 : 200)  // 50 for auth, 200 for admin in dev
          : (isAuthRoute ? 10 : 50)   // 10 for auth, 50 for admin in production
        const windowMs = 15 * 60 * 1000 // 15 minutes

        if (!rateLimit(identifier, limit, windowMs)) {
          return NextResponse.json(
            {
              error: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil(windowMs / 1000) // seconds
            },
            { status: 429 }
          )
        }
      }
    }
  
  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  // Basic CSP (adjust as needed)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
  ].join('; ')
  response.headers.set('Content-Security-Policy', csp)

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return response
  }
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // Extract token from cookie or Authorization header
    const cookieToken = request.cookies.get('auth_token')?.value || null
    const headerToken = extractTokenFromHeader(request.headers.get('authorization'))
    const token = cookieToken || headerToken
    
    if (!token) {
      // Redirect to login page for browser requests
      if (request.headers.get('accept')?.includes('text/html')) {
        const url = new URL('/login', request.url)
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
      }
      
      // Return 401 for API requests
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    try {
      // Verify JWT token
      const payload = await verifyJWT(token)

      // Check if admin path and user is admin
      if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
          payload.role !== 'ADMIN') {
        // Redirect to home page for browser requests
        if (request.headers.get('accept')?.includes('text/html')) {
          return NextResponse.redirect(new URL('/', request.url))
        }

        // Return 403 for API requests
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      // User is authenticated and authorized
      return response
    } catch (error) {
      // Invalid token
      // Redirect to login page for browser requests
      if (request.headers.get('accept')?.includes('text/html')) {
        const url = new URL('/login', request.url)
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
      }

      // Return 401 for API requests
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // For all other paths, proceed normally
  return response
  } catch (error) {
    // Catch-all error handler for any middleware failures
    console.error('Middleware error:', error)
    // Return response to allow request to proceed
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}