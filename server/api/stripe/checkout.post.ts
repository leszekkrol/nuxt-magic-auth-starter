import { defineEventHandler, readBody } from 'h3'
import { requireUser } from '../../utils/auth'
import { createCheckoutSession } from '../../utils/stripe'
import { isNonEmptyString, createValidationError } from '../../utils/validation'

interface CheckoutBody {
  priceId: string
  successUrl?: string
  cancelUrl?: string
  mode?: 'payment' | 'subscription'
}

/**
 * POST /api/stripe/checkout
 * Creates a Stripe checkout session for purchasing products or subscriptions
 */
export default defineEventHandler(async (event) => {
  // Require authenticated user
  const user = await requireUser(event)
  
  const body = await readBody<CheckoutBody>(event)
  const config = useRuntimeConfig()
  
  // Validate price ID
  if (!isNonEmptyString(body.priceId)) {
    throw createValidationError([
      { field: 'priceId', message: 'Price ID is required' }
    ])
  }
  
  // Check if user has a Stripe customer ID
  if (!user.stripeCustomerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'User does not have a Stripe customer ID. Please contact support.'
    })
  }
  
  // Get URLs from body or use defaults
  const successUrl = body.successUrl || `${config.public.appUrl}/dashboard?checkout=success`
  const cancelUrl = body.cancelUrl || `${config.public.appUrl}/dashboard?checkout=cancelled`
  const mode = body.mode || 'subscription'
  
  try {
    // Create checkout session
    const session = await createCheckoutSession(
      user.stripeCustomerId,
      body.priceId,
      successUrl,
      cancelUrl,
      mode
    )
    
    return {
      success: true,
      url: session.url,
      sessionId: session.id
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to create checkout session'
    })
  }
})


