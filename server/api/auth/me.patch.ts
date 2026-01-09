import { defineEventHandler, readBody } from 'h3'
import prisma from '../../utils/prisma'
import { requireUser } from '../../utils/auth'

/**
 * PATCH /api/auth/me
 * Updates current authenticated user's data
 * 
 * Accepts any fields from the User model except:
 * - id (cannot be changed)
 * - createdAt (automatically managed)
 * 
 * Examples:
 * - Update name: { name: "John Doe" }
 * - Update multiple fields: { name: "John", bio: "Developer", avatar: "https://..." }
 * - Update custom fields: { role: "admin", preferences: {...} }
 */
export default defineEventHandler(async (event) => {
  // Require authentication and get full user
  const currentUser = await requireUser(event)
  
  // Get update data from request body
  const updateData = await readBody(event)
  
  // Protected fields that cannot be updated via this endpoint
  const protectedFields = ['id', 'createdAt']
  
  // Remove protected fields if they were included
  protectedFields.forEach(field => {
    if (field in updateData) {
      delete updateData[field]
    }
  })
  
  // Check if there's anything to update
  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'No valid fields to update'
    })
  }
  
  // Special validation for email (must be unique)
  if (updateData.email && updateData.email !== currentUser.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: updateData.email }
    })
    
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'Email address is already in use'
      })
    }
  }
  
  try {
    // Update user with provided fields
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData
    })
    
    return {
      success: true,
      user: updatedUser
    }
  } catch (error: any) {
    // Handle Prisma errors (e.g., invalid field names, type mismatches)
    console.error('Error updating user:', error)
    
    // Check if it's a Prisma field validation error
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'User not found'
      })
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: error.message || 'Failed to update user. Please check your data.'
    })
  }
})
