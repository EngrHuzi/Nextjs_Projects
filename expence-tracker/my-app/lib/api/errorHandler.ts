// T227: Global error handler for API routes
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export interface ApiError {
  error: string
  details?: any
  code?: string
}

/**
 * T228: Handle API errors with user-friendly messages
 * T229: Log errors appropriately (console in dev, external service in production)
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // Log error for debugging
  console.error('[API Error]', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this value already exists',
          code: 'DUPLICATE_RECORD',
        },
        { status: 409 }
      )
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Related record not found',
          code: 'FOREIGN_KEY_ERROR',
        },
        { status: 400 }
      )
    }

    // Generic Prisma error
    return NextResponse.json(
      {
        error: 'Database operation failed',
        code: 'DATABASE_ERROR',
      },
      { status: 500 }
    )
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json(
        {
          error: 'You do not have permission to perform this action',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      )
    }

    // Generic error - don't expose internal details in production
    return NextResponse.json(
      {
        error: process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  )
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ApiError>> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status })
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      code: code || 'ERROR',
    },
    { status }
  )
}
