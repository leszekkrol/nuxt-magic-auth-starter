import { defineEventHandler } from 'h3'
import { logoutUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  logoutUser(event)
  
  return {
    success: true,
    message: 'Logged out successfully'
  }
})

