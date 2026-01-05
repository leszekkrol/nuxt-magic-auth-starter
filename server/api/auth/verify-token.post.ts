import { defineEventHandler, readBody } from 'h3'
import prisma from '../../utils/prisma'
import { hashToken, isTokenExpired } from '../../utils/token'
import { loginUser } from '../../utils/auth'
import { isNonEmptyString, createValidationError } from '../../utils/validation'
import { useEmailProvider } from '../../../lib/email'

interface VerifyTokenBody {
  token: string
}

/**
 * POST /api/auth/verify-token
 * Verifies magic link token and creates user session
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<VerifyTokenBody>(event)
  
  // Validate token input
  if (!isNonEmptyString(body.token)) {
    throw createValidationError([
      { field: 'token', message: 'Verification token is required' }
    ])
  }
  
  const hashedToken = hashToken(body.token)
  
  // Find verification token in database
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token: hashedToken }
  })
  
  if (!verificationToken) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid or expired token'
    })
  }
  
  // Check if token was already used
  if (verificationToken.used) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Token has already been used'
    })
  }
  
  // Check token expiration
  if (isTokenExpired(verificationToken.expires)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Token has expired'
    })
  }
  
  // Mark token as used (prevents replay attacks)
  await prisma.verificationToken.update({
    where: { id: verificationToken.id },
    data: { used: true }
  })
  
  // Find existing user or create new one
  let user = await prisma.user.findUnique({
    where: { email: verificationToken.email }
  })
  
  const isNewUser = !user
  
  if (!user) {
    user = await prisma.user.create({
      data: { email: verificationToken.email }
    })
  }
  
  // Send welcome email for new users
  if (isNewUser) {
    const emailProvider = useEmailProvider()
    await emailProvider.sendWelcome(user.email, user.name || 'there')
  }
  
  // Generate JWT and set authentication cookie
  loginUser(event, user)
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    isNewUser
  }
})
