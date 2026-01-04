import { defineEventHandler, readBody } from 'h3'
import prisma from '~/server/utils/prisma'
import { hashToken, isTokenExpired } from '~/server/utils/token'
import { loginUser } from '~/server/utils/auth'
import { useEmailProvider } from '~/lib/email'

interface VerifyTokenBody {
  token: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<VerifyTokenBody>(event)
  
  if (!body.token || typeof body.token !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Token is required'
    })
  }
  
  const hashedToken = hashToken(body.token)
  
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
  
  if (verificationToken.used) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Token has already been used'
    })
  }
  
  if (isTokenExpired(verificationToken.expires)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Token has expired'
    })
  }
  
  // Mark token as used
  await prisma.verificationToken.update({
    where: { id: verificationToken.id },
    data: { used: true }
  })
  
  // Find or create user
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
  
  // Generate JWT and set cookie
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
