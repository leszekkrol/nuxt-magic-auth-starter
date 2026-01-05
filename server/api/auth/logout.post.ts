import { defineEventHandler } from 'h3'
import { logoutUser } from '../../utils/auth'

/**
 * POST /api/auth/logout
 * Clears authentication cookie and ends user session
 */
export default defineEventHandler((event) => {
  logoutUser(event)
  
  return {
    success: true,
    message: 'Logged out successfully'
  }
})
