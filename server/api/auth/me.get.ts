import { defineEventHandler } from 'h3'
import prisma from '../../utils/prisma'
import { getCurrentUser } from '../../utils/auth'

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
