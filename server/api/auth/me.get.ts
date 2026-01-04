import { defineEventHandler } from 'h3'
import prisma from '~/server/utils/prisma'
import { getCurrentUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const tokenPayload = getCurrentUser(event)
  
  if (!tokenPayload) {
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
  
  return { user }
})
