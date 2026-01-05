import { defineEventHandler } from 'h3'
import prisma from '../../utils/prisma'
import { getCurrentUser, getAuthCookie, decodeJWT, refreshTokenIfNeeded } from '../../utils/auth'
import { isValidId } from '../../utils/validation'

/**
 * GET /api/auth/me
 * Returns current authenticated user data with automatic token refresh
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
  
  const user = await prisma.user.findUnique({
    where: { id: tokenPayload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    }
  })
  
  if (!user) {
    return { user: null }
  }
  
  // Auto-refresh token if expiring within 1 hour
  refreshTokenIfNeeded(event, user, 60)
  
  return { user }
})
