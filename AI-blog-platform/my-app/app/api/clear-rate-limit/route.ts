import { NextResponse } from "next/server"
import { rateLimitMap } from "@/lib/middleware"

// Only available in development
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  try {
    // Clear all rate limits
    rateLimitMap.clear()
    
    return NextResponse.json({ 
      success: true, 
      message: "Rate limits cleared successfully",
      clearedCount: rateLimitMap.size
    })
  } catch {
    return NextResponse.json({ 
      error: "Failed to clear rate limits" 
    }, { status: 500 })
  }
}

// GET endpoint to check rate limit status
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  return NextResponse.json({
    rateLimitEntries: rateLimitMap.size,
    entries: Array.from(rateLimitMap.entries()).map(([key, value]) => ({
      identifier: key,
      count: value.count,
      resetTime: new Date(value.resetTime).toISOString(),
      isExpired: Date.now() > value.resetTime
    }))
  })
}
