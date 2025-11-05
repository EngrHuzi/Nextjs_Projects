import Decimal from 'decimal.js'

/**
 * Utility functions for precise decimal arithmetic to prevent floating-point errors
 * in financial calculations.
 */

// Configure Decimal.js defaults for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
})

/**
 * Add two decimal numbers
 */
export function addDecimal(a: number | string, b: number | string): number {
  return new Decimal(a).plus(new Decimal(b)).toNumber()
}

/**
 * Subtract two decimal numbers (a - b)
 */
export function subtractDecimal(a: number | string, b: number | string): number {
  return new Decimal(a).minus(new Decimal(b)).toNumber()
}

/**
 * Multiply two decimal numbers
 */
export function multiplyDecimal(a: number | string, b: number | string): number {
  return new Decimal(a).times(new Decimal(b)).toNumber()
}

/**
 * Divide two decimal numbers (a / b)
 */
export function divideDecimal(a: number | string, b: number | string): number {
  if (new Decimal(b).isZero()) {
    throw new Error('Division by zero')
  }
  return new Decimal(a).dividedBy(new Decimal(b)).toNumber()
}

/**
 * Round a decimal to specified decimal places (default: 2 for currency)
 */
export function roundDecimal(value: number | string, decimalPlaces: number = 2): number {
  return new Decimal(value).toDecimalPlaces(decimalPlaces).toNumber()
}

/**
 * Format a decimal as currency string (USD)
 */
export function formatCurrency(value: number | string): string {
  const num = new Decimal(value).toNumber()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

/**
 * Format a decimal as a number with specified decimal places
 */
export function formatDecimal(value: number | string, decimalPlaces: number = 2): string {
  return new Decimal(value).toFixed(decimalPlaces)
}

/**
 * Compare two decimals: returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareDecimal(a: number | string, b: number | string): -1 | 0 | 1 {
  const result = new Decimal(a).comparedTo(new Decimal(b))
  return result as -1 | 0 | 1
}

/**
 * Check if a decimal is zero
 */
export function isZeroDecimal(value: number | string): boolean {
  return new Decimal(value).isZero()
}

/**
 * Check if a decimal is positive
 */
export function isPositiveDecimal(value: number | string): boolean {
  return new Decimal(value).isPositive()
}

/**
 * Check if a decimal is negative
 */
export function isNegativeDecimal(value: number | string): boolean {
  return new Decimal(value).isNegative()
}

/**
 * Sum an array of decimal values
 */
export function sumDecimals(values: (number | string)[]): number {
  return values
    .reduce((sum, value) => sum.plus(new Decimal(value)), new Decimal(0))
    .toNumber()
}

/**
 * Calculate percentage of a value
 * @example calculatePercentage(50, 200) // 25
 */
export function calculatePercentage(part: number | string, total: number | string): number {
  if (new Decimal(total).isZero()) {
    return 0
  }
  return new Decimal(part).dividedBy(new Decimal(total)).times(100).toNumber()
}

/**
 * Parse a currency string to number
 * @example parseCurrency("$1,234.56") // 1234.56
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[$,]/g, '')
  return new Decimal(cleaned).toNumber()
}
