import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * JWT token payload structure
 */
export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Authenticated user data structure
 */
export interface AuthUser {
  id: string
  email: string
  name: string | null
}

// ============================================================================
// Configuration Constants
// ============================================================================

const JWT_COOKIE_NAME = 'auth_token'
const JWT_EXPIRATION = '7d'
const JWT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

// ============================================================================
// JWT Secret Management
// ============================================================================

/**
 * Retrieves JWT secret from runtime configuration
 * @throws Error if JWT_SECRET is not configured
 */
function getJwtSecret(): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Please set it in your environment variables.')
  }
  
  return secret
}

// ============================================================================
// JWT Token Operations
// ============================================================================

/**
 * Generates a signed JWT token with the provided payload
 * @param payload - User data to encode in the token
 * @returns Signed JWT string
 */
export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRATION })
}

/**
 * Verifies and decodes a JWT token
 * @param token - JWT string to verify
 * @returns Decoded payload if valid, null if invalid or expired
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Decodes a JWT token without verification (useful for debugging)
 * WARNING: Do not use for authentication - use verifyJWT instead
 * @param token - JWT string to decode
 * @returns Decoded payload or null if invalid format
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Extracts JWT token expiration timestamp
 * @param token - JWT string
 * @returns Expiration date or null if invalid
 */
export function getJwtExpiration(token: string): Date | null {
  const decoded = decodeJWT(token)
  if (!decoded?.exp) return null
  return new Date(decoded.exp * 1000)
}

/**
 * Checks if a token is close to expiration (within threshold)
 * @param token - JWT string
 * @param thresholdMinutes - Minutes before expiration to consider "close"
 * @returns True if token expires within threshold
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 60): boolean {
  const expiration = getJwtExpiration(token)
  if (!expiration) return true
  
  const thresholdMs = thresholdMinutes * 60 * 1000
  return expiration.getTime() - Date.now() < thresholdMs
}

// ============================================================================
// Cookie Management
// ============================================================================

/**
 * Sets the authentication cookie with JWT token
 * @param event - H3 event context
 * @param token - JWT token to store
 */
export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_COOKIE_MAX_AGE,
    path: '/'
  })
}

/**
 * Retrieves the authentication cookie value
 * @param event - H3 event context
 * @returns JWT token string or undefined
 */
export function getAuthCookie(event: H3Event): string | undefined {
  return getCookie(event, JWT_COOKIE_NAME)
}

/**
 * Clears the authentication cookie
 * @param event - H3 event context
 */
export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, JWT_COOKIE_NAME, { path: '/' })
}

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Gets the current authenticated user from the request
 * @param event - H3 event context
 * @returns JWT payload if authenticated, null otherwise
 */
export function getCurrentUser(event: H3Event): JWTPayload | null {
  const token = getAuthCookie(event)
  if (!token) return null
  return verifyJWT(token)
}

/**
 * Checks if the current request is authenticated
 * @param event - H3 event context
 * @returns True if user is authenticated
 */
export function isAuthenticated(event: H3Event): boolean {
  return getCurrentUser(event) !== null
}

/**
 * Requires authentication for the current request
 * @param event - H3 event context
 * @returns JWT payload if authenticated
 * @throws 401 error if not authenticated
 */
export function requireAuth(event: H3Event): JWTPayload {
  const user = getCurrentUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required'
    })
  }
  
  return user
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Logs in a user by generating JWT and setting auth cookie
 * @param event - H3 event context
 * @param user - User data to encode in token
 * @returns Generated JWT token
 */
export function loginUser(event: H3Event, user: AuthUser): string {
  const token = generateJWT({
    userId: user.id,
    email: user.email
  })
  
  setAuthCookie(event, token)
  return token
}

/**
 * Logs out the current user by clearing auth cookie
 * @param event - H3 event context
 */
export function logoutUser(event: H3Event): void {
  clearAuthCookie(event)
}

/**
 * Refreshes the user's JWT token if expiring soon
 * @param event - H3 event context
 * @param user - Current user data
 * @param thresholdMinutes - Minutes before expiration to trigger refresh
 * @returns New token if refreshed, null otherwise
 */
export function refreshTokenIfNeeded(event: H3Event, user: AuthUser, thresholdMinutes: number = 60): string | null {
  const currentToken = getAuthCookie(event)
  
  if (!currentToken || !isTokenExpiringSoon(currentToken, thresholdMinutes)) {
    return null
  }
  
  return loginUser(event, user)
}
