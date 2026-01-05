import { randomBytes, createHash } from 'crypto'

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generates a cryptographically secure random token
 * @param length - Number of random bytes (output will be 2x in hex)
 * @returns Hex-encoded random string
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

/**
 * Generates a human-readable short token (e.g., for verification codes)
 * Uses unambiguous characters to avoid confusion (no 0/O, 1/I/L)
 * @param length - Number of characters in the token
 * @returns Uppercase alphanumeric string
 */
export function generateShortToken(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  const bytes = randomBytes(length)
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  
  return result
}

// ============================================================================
// Token Hashing
// ============================================================================

/**
 * Creates SHA-256 hash of a token for secure storage
 * @param token - Plain text token to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Verifies a token against its stored hash
 * @param token - Plain text token to verify
 * @param hash - Stored hash to compare against
 * @returns True if token matches hash
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  return hashToken(token) === hash
}

// ============================================================================
// Token Expiration
// ============================================================================

/**
 * Calculates expiration date for a token
 * @param minutes - Minutes until expiration (default: 15)
 * @returns Date object representing expiration time
 */
export function getTokenExpiration(minutes: number = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

/**
 * Checks if a token has expired
 * @param expirationDate - Token's expiration date
 * @returns True if current time is past expiration
 */
export function isTokenExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate
}

/**
 * Calculates remaining time until token expiration
 * @param expirationDate - Token's expiration date
 * @returns Remaining seconds (0 if already expired)
 */
export function getTokenRemainingTime(expirationDate: Date): number {
  const remaining = expirationDate.getTime() - Date.now()
  return Math.max(0, Math.floor(remaining / 1000))
}
