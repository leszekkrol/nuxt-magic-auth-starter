import { defineEventHandler, readBody } from 'h3'
import prisma from '../../utils/prisma'
import { validateAndNormalizeEmail, normalizeName, isValidName, createValidationError } from '../../utils/validation'
import { generateSecureToken, hashToken, getTokenExpiration } from '../../utils/token'
import { useEmailProvider } from '../../../lib/email'

interface SendMagicLinkBody {
  email: string
  name?: string
}

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 3           // Max requests per window
const RATE_LIMIT_WINDOW = 15 * 60 * 1000  // 15 minutes in ms

/**
 * Checks and updates rate limit for email
 * @param email - Email address to check
 * @returns True if within rate limit, false if exceeded
 */
function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(email)
  
  // Reset if window expired or first request
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  entry.count++
  return true
}

// ============================================================================
// API Handler
// ============================================================================

/**
 * POST /api/auth/send-magic-link
 * Sends magic link email for passwordless authentication
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<SendMagicLinkBody>(event)
  
  // Validate and normalize email
  const email = validateAndNormalizeEmail(body.email || '')
  if (!email) {
    throw createValidationError([
      { field: 'email', message: 'Valid email address is required' }
    ])
  }
  
  // Enforce rate limiting
  if (!checkRateLimit(email)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: 'Too many login attempts. Please try again later.'
    })
  }
  
  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } })
  
  if (!user) {
    const name = body.name && isValidName(body.name) ? normalizeName(body.name) : null
    
    user = await prisma.user.create({
      data: { email, name }
    })
  }
  
  // Invalidate previous unused tokens (security measure)
  await prisma.verificationToken.updateMany({
    where: { email, used: false },
    data: { used: true }
  })
  
  // Generate new secure verification token
  const token = generateSecureToken()
  const hashedToken = hashToken(token)
  const expires = getTokenExpiration(15) // 15 minutes
  
  await prisma.verificationToken.create({
    data: {
      token: hashedToken,
      email,
      expires
    }
  })
  
  // Send magic link via configured email provider
  const emailProvider = useEmailProvider()
  await emailProvider.sendMagicLink(email, token, user.name || undefined)
  
  return {
    success: true,
    message: 'Magic link sent to your email'
  }
})
