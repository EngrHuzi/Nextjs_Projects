import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT, extractTokenFromHeader } from '@/lib/jwt'

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
  '/',
  '/login',
  '/register',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(request.headers.get('authorization'))
    
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
      return NextResponse.next()
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
  return NextResponse.next()
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