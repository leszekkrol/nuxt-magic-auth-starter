// =============================================================================
// Stripe Utility - Payment Processing
// =============================================================================

import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Get Stripe instance (singleton pattern)
 * Initializes Stripe with the secret key from environment variables
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const config = useRuntimeConfig()
    
    if (!config.stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured in environment variables')
    }

    stripeInstance = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  }

  return stripeInstance
}

/**
 * Create a Stripe customer
 * 
 * @param email - Customer email address
 * @param name - Customer name (optional)
 * @returns Stripe customer object
 */
export async function createStripeCustomer(
  email: string,
  name?: string | null
): Promise<Stripe.Customer> {
  const stripe = getStripe()

  try {
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        source: 'magic-auth-starter',
      },
    })

    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

/**
 * Get a Stripe customer by ID
 * 
 * @param customerId - Stripe customer ID
 * @returns Stripe customer object or null if not found
 */
export async function getStripeCustomer(
  customerId: string
): Promise<Stripe.Customer | null> {
  const stripe = getStripe()

  try {
    const customer = await stripe.customers.retrieve(customerId)
    
    if (customer.deleted) {
      return null
    }

    return customer as Stripe.Customer
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error)
    return null
  }
}

/**
 * Update a Stripe customer
 * 
 * @param customerId - Stripe customer ID
 * @param data - Data to update
 * @returns Updated Stripe customer object
 */
export async function updateStripeCustomer(
  customerId: string,
  data: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  const stripe = getStripe()

  try {
    const customer = await stripe.customers.update(customerId, data)
    return customer
  } catch (error) {
    console.error('Error updating Stripe customer:', error)
    throw error
  }
}

/**
 * Create a billing portal session
 * Used to allow customers to manage their subscriptions and payment methods
 * 
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to redirect to after the customer finishes managing their billing
 * @returns Billing portal session with URL
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe()

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return session
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    throw error
  }
}

/**
 * Create a checkout session for one-time payments or subscriptions
 * 
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID
 * @param successUrl - URL to redirect to after successful payment
 * @param cancelUrl - URL to redirect to if customer cancels
 * @param mode - Payment mode: 'payment' for one-time, 'subscription' for recurring
 * @returns Checkout session with URL
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  mode: 'payment' | 'subscription' = 'subscription'
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}


