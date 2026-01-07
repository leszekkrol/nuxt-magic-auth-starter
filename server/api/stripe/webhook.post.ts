import { defineEventHandler, readRawBody } from 'h3'
import { getStripe } from '../../utils/stripe'
import Stripe from 'stripe'

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 * 
 * Important: This endpoint must receive the raw body for signature verification
 * Configure webhook URL in Stripe Dashboard: https://dashboard.stripe.com/webhooks
 * 
 * Common events to handle:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = getStripe()
  
  // Get raw body for signature verification
  const body = await readRawBody(event)
  const signature = event.node.req.headers['stripe-signature']
  
  if (!body || !signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Missing body or signature'
    })
  }
  
  // Verify webhook signature
  let stripeEvent: Stripe.Event
  
  try {
    if (!config.stripeWebhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature verification')
      stripeEvent = JSON.parse(body)
    } else {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripeWebhookSecret
      )
    }
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid signature'
    })
  }
  
  // Handle the event
  console.log(`Received Stripe webhook: ${stripeEvent.type}`)
  
  try {
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        console.log(`Subscription ${stripeEvent.type}:`, subscription.id)
        // TODO: Update subscription status in your database
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        // TODO: Grant access or update subscription status
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        // TODO: Send payment failure notification to user
        break
      }
      
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        console.log('Checkout completed:', session.id)
        // TODO: Fulfill the purchase
        break
      }
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }
  } catch (error) {
    console.error(`Error handling webhook event ${stripeEvent.type}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to process webhook'
    })
  }
  
  return { received: true }
})


