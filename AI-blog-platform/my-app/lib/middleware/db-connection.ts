import { NextRequest, NextResponse } from 'next/server'
import { verifyDatabaseConnection } from '../db'
import { logger } from '../logger'

/**
 * Middleware to verify database connection
 * This can be used in API routes to ensure database is connected
 */
export async function withDatabaseConnection(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const connected = await verifyDatabaseConnection()
    
    if (!connected) {
      logger.error('Database connection failed in middleware')
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 503 }
      )
    }
    
    return await handler(req)
  } catch (error) {
    logger.error('Error in database connection middleware', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}