import bcrypt from 'bcryptjs'

/**
 * Password hashing and verification utilities using bcrypt
 * Cost factor: 12 (recommended for 2024, balances security and performance)
 */

const BCRYPT_COST_FACTOR = 12

/**
 * Hash a plain-text password using bcrypt
 * @param password - Plain-text password to hash
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST_FACTOR)
}

/**
 * Verify a plain-text password against a hashed password
 * @param password - Plain-text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
