import { defineEventHandler, readBody } from 'h3'
import { requireUser } from '../../utils/auth'
import { createBillingPortalSession } from '../../utils/stripe'
import prisma from '../../utils/prisma'

interface BillingPortalBody {
  returnUrl?: string
}

/**
 * POST /api/stripe/billing-portal
 * Creates a Stripe billing portal session for the authenticated user
 * Allows customers to manage subscriptions, payment methods, and billing history
 */
export default defineEventHandler(async (event) => {
  // Require authenticated user
  const user = await requireUser(event)
  
  const body = await readBody<BillingPortalBody>(event)
  const config = useRuntimeConfig()
  
  // Get return URL from body or use default
  const returnUrl = body.returnUrl || `${config.public.appUrl}/profile`
  
  // Check if user has a Stripe customer ID
  if (!user.stripeCustomerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'User does not have a Stripe customer ID. Please contact support.'
    })
  }
  
  try {
    // Create billing portal session
    const session = await createBillingPortalSession(user.stripeCustomerId, returnUrl)
    
    return {
      success: true,
      url: session.url
    }
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to create billing portal session'
    })
  }
})


