import { defineEventHandler } from 'h3'
import prisma from '../../utils/prisma'
import { getCurrentUser, getAuthCookie, decodeJWT, refreshTokenIfNeeded } from '../../utils/auth'
import { isValidId } from '../../utils/validation'

/**
 * GET /api/auth/me
 * Returns current authenticated user data with all fields from database
 * Includes automatic token refresh when expiring soon
 * 
 * Returns all user fields including:
 * - id, email, name
 * - stripeCustomerId (if Stripe integration enabled)
 * - createdAt, updatedAt
 * - any additional custom fields added to User model
 */
export default defineEventHandler(async (event) => {
  const tokenPayload = getCurrentUser(event)
  
  if (!tokenPayload) {
    return { user: null }
  }
  
  // Validate userId format before database query
  if (!isValidId(tokenPayload.userId)) {
    const rawToken = getAuthCookie(event)
    if (rawToken) {
      const decoded = decodeJWT(rawToken)
      console.warn('[Auth] Invalid userId format in token:', { 
        userId: decoded?.userId,
        email: decoded?.email 
      })
    }
    return { user: null }
  }
  
  // Fetch user with all fields from database (including stripeCustomerId and any custom fields)
  const user = await prisma.user.findUnique({
    where: { id: tokenPayload.userId }
    // No select clause - returns all fields
  })
  
  if (!user) {
    return { user: null }
  }
  
  // Auto-refresh token if expiring within 1 hour
  refreshTokenIfNeeded(event, user, 60)
  
  return { user }
})
