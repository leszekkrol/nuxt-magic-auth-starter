import { defineEventHandler, getQuery } from 'h3'
import { requireUser } from '../../utils/auth'
import { getStripe } from '../../utils/stripe'

/**
 * GET /api/stripe/subscription
 * Returns current user's Stripe subscription status
 * 
 * Query params:
 * - priceId (optional): Check if user has subscription with specific price
 * - productId (optional): Check if user has subscription with specific product
 */
export default defineEventHandler(async (event) => {
  // Require authentication and get full user
  const currentUser = await requireUser(event)
  
  // Check if user has Stripe customer ID
  if (!currentUser.stripeCustomerId) {
    return {
      hasSubscription: false,
      subscription: null,
      status: null
    }
  }
  
  const query = getQuery(event)
  const priceId = query.priceId as string | undefined
  const productId = query.productId as string | undefined
  
  try {
    const stripe = getStripe()
    
    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: currentUser.stripeCustomerId,
      status: 'all',
      expand: ['data.items.data.price.product']
    })
    
    // Filter active subscriptions
    const activeSubscriptions = subscriptions.data.filter(
      sub => sub.status === 'active' || sub.status === 'trialing'
    )
    
    // If no active subscriptions
    if (activeSubscriptions.length === 0) {
      return {
        hasSubscription: false,
        subscription: null,
        status: null,
        allSubscriptions: subscriptions.data.map(sub => ({
          id: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end
        }))
      }
    }
    
    // If checking for specific price or product
    if (priceId || productId) {
      const matchingSubscription = activeSubscriptions.find(sub => {
        return sub.items.data.some(item => {
          if (priceId && item.price.id === priceId) return true
          if (productId) {
            if (typeof item.price.product === 'object') {
              return item.price.product.id === productId
            }
            return item.price.product === productId
          }
          return false
        })
      })
      
      if (matchingSubscription) {
        return {
          hasSubscription: true,
          subscription: {
            id: matchingSubscription.id,
            status: matchingSubscription.status,
            currentPeriodEnd: matchingSubscription.current_period_end,
            cancelAtPeriodEnd: matchingSubscription.cancel_at_period_end,
            items: matchingSubscription.items.data.map(item => ({
              priceId: item.price.id,
              productId: typeof item.price.product === 'object' ? item.price.product.id : item.price.product
            }))
          },
          status: matchingSubscription.status
        }
      }
      
      // No matching subscription found
      return {
        hasSubscription: false,
        subscription: null,
        status: null,
        message: `No active subscription found for ${priceId ? 'price' : 'product'}`,
        allSubscriptions: activeSubscriptions.map(sub => ({
          id: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end
        }))
      }
    }
    
    // Return first active subscription (when no specific price/product requested)
    const subscription = activeSubscriptions[0]
    
    return {
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        items: subscription.items.data.map(item => ({
          priceId: item.price.id,
          productId: typeof item.price.product === 'object' ? item.price.product.id : item.price.product
        }))
      },
      status: subscription.status,
      allSubscriptions: activeSubscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: sub.current_period_end
      }))
    }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch subscription status'
    })
  }
})
