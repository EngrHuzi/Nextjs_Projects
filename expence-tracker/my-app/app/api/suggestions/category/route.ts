// T187-T189: API route for category suggestions based on description
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import { suggestCategoryByKeywords, findHistoricalMatch } from '@/lib/services/categoryKeywords'
import { z } from 'zod'

// Request schema validation
const suggestionRequestSchema = z.object({
  description: z.string().min(1).max(200),
  type: z.enum(['EXPENSE', 'INCOME'])
})

// T187: POST /api/suggestions/category - Suggest category based on description
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = suggestionRequestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { description, type } = validation.data

    // T188: Try keyword matching first
    const keywordMatch = suggestCategoryByKeywords(description, type)

    if (keywordMatch && keywordMatch.confidence >= 70) {
      // High-confidence keyword match - return immediately
      return NextResponse.json({
        suggestion: keywordMatch,
        method: 'keyword'
      })
    }

    // T189: If no high-confidence keyword match, search historical transactions
    try {
      const historicalTransactions = await prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          type: type,
          description: {
            not: null
          }
        },
        select: {
          description: true,
          category: true
        },
        take: 100, // Limit to last 100 transactions for performance
        orderBy: {
          createdAt: 'desc'
        }
      })

      const historicalMatch = findHistoricalMatch(description, historicalTransactions)

      // If historical match is better than keyword match, use it
      if (historicalMatch && (!keywordMatch || historicalMatch.confidence > keywordMatch.confidence)) {
        return NextResponse.json({
          suggestion: historicalMatch,
          method: 'historical'
        })
      }

      // Return keyword match if it exists (even with lower confidence)
      if (keywordMatch) {
        return NextResponse.json({
          suggestion: keywordMatch,
          method: 'keyword'
        })
      }

      // No suggestion found
      return NextResponse.json({
        suggestion: null,
        method: 'none'
      })
    } catch (dbError) {
      console.error('Error fetching historical transactions:', dbError)

      // Fall back to keyword match even if confidence is low
      if (keywordMatch) {
        return NextResponse.json({
          suggestion: keywordMatch,
          method: 'keyword'
        })
      }

      // No suggestion available
      return NextResponse.json({
        suggestion: null,
        method: 'none'
      })
    }
  } catch (error) {
    console.error('Error in category suggestion:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    )
  }
}
