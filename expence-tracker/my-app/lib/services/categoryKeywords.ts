// T185-T186: Keyword mapping service for AI category suggestions
// This service provides intelligent category suggestions based on keyword matching

export interface CategorySuggestion {
  category: string
  confidence: number // 0-100
  reason: string
}

/**
 * Keyword patterns for common expense categories
 * Each category maps to an array of keywords/phrases
 * Keywords are case-insensitive and support partial matching
 */
const EXPENSE_KEYWORDS: Record<string, string[]> = {
  'Food': [
    'restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'cafe', 'coffee',
    'pizza', 'burger', 'sandwich', 'meal', 'grocery', 'supermarket',
    'mcdonald', 'starbucks', 'subway', 'domino', 'kfc', 'taco', 'chipotle',
    'bakery', 'deli', 'bistro', 'diner', 'eatery', 'buffet', 'cuisine',
    'cooking', 'takeout', 'delivery', 'uber eats', 'doordash', 'grubhub'
  ],
  'Transportation': [
    'uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'subway', 'metro',
    'gas', 'fuel', 'petrol', 'parking', 'toll', 'car', 'vehicle',
    'airline', 'flight', 'airport', 'travel', 'ticket', 'fare',
    'rental', 'transit', 'transport', 'commute', 'ride', 'drive'
  ],
  'Shopping': [
    'amazon', 'ebay', 'walmart', 'target', 'store', 'shop', 'mall',
    'purchase', 'buy', 'order', 'retail', 'clothing', 'clothes',
    'shoes', 'apparel', 'fashion', 'accessories', 'electronics',
    'online', 'delivery', 'shipping', 'cart', 'checkout'
  ],
  'Entertainment': [
    'movie', 'cinema', 'theater', 'concert', 'show', 'ticket',
    'netflix', 'spotify', 'hulu', 'disney', 'streaming', 'subscription',
    'game', 'gaming', 'xbox', 'playstation', 'steam', 'entertainment',
    'museum', 'park', 'zoo', 'event', 'festival', 'recreation'
  ],
  'Healthcare': [
    'doctor', 'hospital', 'clinic', 'pharmacy', 'medicine', 'medical',
    'health', 'dental', 'dentist', 'prescription', 'drugs', 'treatment',
    'insurance', 'copay', 'appointment', 'checkup', 'exam', 'surgery',
    'therapy', 'counseling', 'wellness', 'fitness', 'gym'
  ],
  'Utilities': [
    'electric', 'electricity', 'gas', 'water', 'internet', 'phone',
    'cable', 'utility', 'bill', 'service', 'verizon', 'at&t', 'comcast',
    'power', 'energy', 'heating', 'cooling', 'trash', 'sewage'
  ],
  'Rent': [
    'rent', 'lease', 'landlord', 'apartment', 'house', 'housing',
    'mortgage', 'property', 'tenant', 'dwelling', 'residence'
  ],
  'Travel': [
    'hotel', 'airbnb', 'booking', 'vacation', 'trip', 'resort',
    'lodging', 'accommodation', 'flight', 'airline', 'airport',
    'suitcase', 'luggage', 'passport', 'tourist', 'destination'
  ],
  'Other': [
    'misc', 'miscellaneous', 'other', 'unknown', 'various', 'general'
  ]
}

/**
 * Keyword patterns for common income categories
 */
const INCOME_KEYWORDS: Record<string, string[]> = {
  'Salary': [
    'salary', 'paycheck', 'wage', 'income', 'pay', 'payroll',
    'employment', 'compensation', 'earnings', 'work', 'job'
  ],
  'Freelance': [
    'freelance', 'contract', 'gig', 'project', 'client', 'invoice',
    'consulting', 'independent', 'self-employed', 'upwork', 'fiverr'
  ],
  'Investment': [
    'dividend', 'interest', 'capital gains', 'investment', 'stock',
    'bond', 'fund', 'portfolio', 'returns', 'profit', 'trading'
  ],
  'Gift': [
    'gift', 'present', 'donation', 'bonus', 'reward', 'prize',
    'windfall', 'inheritance', 'grant', 'award'
  ],
  'Other Income': [
    'refund', 'reimbursement', 'rebate', 'cashback', 'return',
    'misc', 'miscellaneous', 'other', 'various', 'side hustle'
  ]
}

/**
 * T186: Match description against keyword patterns
 * Returns category with highest match score
 */
export function suggestCategoryByKeywords(
  description: string,
  transactionType: 'EXPENSE' | 'INCOME'
): CategorySuggestion | null {
  if (!description || description.trim().length === 0) {
    return null
  }

  const normalizedDescription = description.toLowerCase().trim()
  const keywords = transactionType === 'EXPENSE' ? EXPENSE_KEYWORDS : INCOME_KEYWORDS

  let bestMatch: CategorySuggestion | null = null
  let highestScore = 0

  for (const [category, patterns] of Object.entries(keywords)) {
    let matchScore = 0
    let matchedKeywords: string[] = []

    for (const keyword of patterns) {
      if (normalizedDescription.includes(keyword.toLowerCase())) {
        // Exact word match gets higher score
        const wordBoundary = new RegExp(`\\b${keyword.toLowerCase()}\\b`)
        if (wordBoundary.test(normalizedDescription)) {
          matchScore += 10
        } else {
          matchScore += 5 // Partial match
        }
        matchedKeywords.push(keyword)
      }
    }

    // Calculate confidence (0-100)
    const confidence = Math.min(100, matchScore * 5)

    if (matchScore > highestScore && confidence >= 50) {
      highestScore = matchScore
      bestMatch = {
        category,
        confidence,
        reason: `Matched keywords: ${matchedKeywords.slice(0, 3).join(', ')}`
      }
    }
  }

  return bestMatch
}

/**
 * T189: Search user's past transactions for similar descriptions
 * This function will be used as a fallback when keyword matching fails
 */
export interface HistoricalMatch {
  description: string
  category: string
  similarity: number // 0-100
}

/**
 * Calculate similarity between two strings using simple word overlap
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 2)

  if (words1.length === 0 || words2.length === 0) {
    return 0
  }

  const commonWords = words1.filter(w => words2.includes(w))
  const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100

  return Math.round(similarity)
}

/**
 * Find best matching historical transaction
 */
export function findHistoricalMatch(
  description: string,
  historicalTransactions: { description: string | null, category: string }[]
): CategorySuggestion | null {
  if (!description || description.trim().length === 0 || historicalTransactions.length === 0) {
    return null
  }

  let bestMatch: HistoricalMatch | null = null
  let highestSimilarity = 0

  for (const tx of historicalTransactions) {
    if (!tx.description) continue

    const similarity = calculateSimilarity(description, tx.description)

    if (similarity > highestSimilarity && similarity >= 50) {
      highestSimilarity = similarity
      bestMatch = {
        description: tx.description,
        category: tx.category,
        similarity
      }
    }
  }

  if (bestMatch) {
    return {
      category: bestMatch.category,
      confidence: bestMatch.similarity,
      reason: `Similar to: "${bestMatch.description.substring(0, 50)}${bestMatch.description.length > 50 ? '...' : ''}"`
    }
  }

  return null
}

/**
 * Get all available expense categories for suggestions
 */
export function getExpenseCategories(): string[] {
  return Object.keys(EXPENSE_KEYWORDS)
}

/**
 * Get all available income categories for suggestions
 */
export function getIncomeCategories(): string[] {
  return Object.keys(INCOME_KEYWORDS)
}
