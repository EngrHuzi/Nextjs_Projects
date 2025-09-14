import type { NextRequest } from 'next/server'

export * from './db-connection'

// Simple in-memory rate limiting (use Redis in production)
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const key = identifier
  const current = rateLimitMap.get(key)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= limit) {
    return false
  }

  current.count++
  return true
}

export function getRateLimitIdentifier(request: NextRequest): string {
  // Use IP + User-Agent for better identification
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const ua = request.headers.get('user-agent') || 'unknown'
  return `${ip}-${ua.slice(0, 50)}`
}