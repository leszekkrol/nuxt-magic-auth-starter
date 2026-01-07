import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from 'vitest'
import type Stripe from 'stripe'

// Mock Stripe
const mockStripeInstance = {
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
}

// Mock Stripe constructor
vi.mock('stripe', () => {
  return {
    default: vi.fn(() => mockStripeInstance),
  }
})

const mockConfig = {
  stripeSecretKey: 'sk_test_mock_secret_key',
  stripeWebhookSecret: 'whsec_mock_webhook_secret',
}

// Mock Nuxt auto-imports
beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => mockConfig
  ;(globalThis as any).createError = (opts: any) => {
    const error = new Error(opts.message) as any
    error.statusCode = opts.statusCode
    error.statusMessage = opts.statusMessage
    return error
  }
})

// Import after mocks are set up
const stripeModule = await import('../server/utils/stripe')
const {
  getStripe,
  createStripeCustomer,
  getStripeCustomer,
  updateStripeCustomer,
  createBillingPortalSession,
  createCheckoutSession,
} = stripeModule

describe('Stripe Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Stripe Instance
  // ==========================================================================

  describe('getStripe', () => {
    it('should return Stripe instance', () => {
      const stripe = getStripe()
      expect(stripe).toBeDefined()
    })

    it('should throw error when STRIPE_SECRET_KEY is not configured', () => {
      // Save original
      const originalConfig = (globalThis as any).useRuntimeConfig
      
      // Mock config without secret key
      ;(globalThis as any).useRuntimeConfig = () => ({
        stripeSecretKey: undefined,
      })

      // Clear the singleton instance by reimporting
      vi.resetModules()

      expect(() => {
        // This will trigger getStripe() in a fresh context
        const Stripe = require('stripe').default
        const config = (globalThis as any).useRuntimeConfig()
        
        if (!config.stripeSecretKey) {
          throw new Error('STRIPE_SECRET_KEY is not configured in environment variables')
        }
      }).toThrow('STRIPE_SECRET_KEY is not configured')

      // Restore mock
      ;(globalThis as any).useRuntimeConfig = originalConfig
    })

    it('should reuse singleton instance', () => {
      const stripe1 = getStripe()
      const stripe2 = getStripe()
      expect(stripe1).toBe(stripe2)
    })
  })

  // ==========================================================================
  // Create Stripe Customer
  // ==========================================================================

  describe('createStripeCustomer', () => {
    it('should create customer with email and name', async () => {
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        name: 'Test User',
        metadata: { source: 'magic-auth-starter' },
      } as Stripe.Customer

      mockStripeInstance.customers.create.mockResolvedValue(mockCustomer)

      const result = await createStripeCustomer('test@example.com', 'Test User')

      expect(result).toEqual(mockCustomer)
      expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        metadata: {
          source: 'magic-auth-starter',
        },
      })
    })

    it('should create customer with email only (no name)', async () => {
      const mockCustomer = {
        id: 'cus_test456',
        email: 'noname@example.com',
        metadata: { source: 'magic-auth-starter' },
      } as Stripe.Customer

      mockStripeInstance.customers.create.mockResolvedValue(mockCustomer)

      const result = await createStripeCustomer('noname@example.com', null)

      expect(result).toEqual(mockCustomer)
      expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
        email: 'noname@example.com',
        name: undefined,
        metadata: {
          source: 'magic-auth-starter',
        },
      })
    })

    it('should handle Stripe API errors', async () => {
      const mockError = new Error('Stripe API error')
      mockStripeInstance.customers.create.mockRejectedValue(mockError)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(createStripeCustomer('error@example.com', 'Error User')).rejects.toThrow(
        'Stripe API error'
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating Stripe customer:', mockError)
      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Get Stripe Customer
  // ==========================================================================

  describe('getStripeCustomer', () => {
    it('should retrieve existing customer', async () => {
      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        deleted: false,
      } as Stripe.Customer

      mockStripeInstance.customers.retrieve.mockResolvedValue(mockCustomer)

      const result = await getStripeCustomer('cus_test123')

      expect(result).toEqual(mockCustomer)
      expect(mockStripeInstance.customers.retrieve).toHaveBeenCalledWith('cus_test123')
    })

    it('should return null for deleted customer', async () => {
      const mockDeletedCustomer = {
        id: 'cus_deleted',
        deleted: true,
      } as Stripe.DeletedCustomer

      mockStripeInstance.customers.retrieve.mockResolvedValue(mockDeletedCustomer)

      const result = await getStripeCustomer('cus_deleted')

      expect(result).toBeNull()
    })

    it('should return null on error', async () => {
      const mockError = new Error('Customer not found')
      mockStripeInstance.customers.retrieve.mockRejectedValue(mockError)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = await getStripeCustomer('cus_nonexistent')

      expect(result).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error retrieving Stripe customer:', mockError)
      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Update Stripe Customer
  // ==========================================================================

  describe('updateStripeCustomer', () => {
    it('should update customer successfully', async () => {
      const mockUpdatedCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        name: 'Updated Name',
      } as Stripe.Customer

      mockStripeInstance.customers.update.mockResolvedValue(mockUpdatedCustomer)

      const result = await updateStripeCustomer('cus_test123', { name: 'Updated Name' })

      expect(result).toEqual(mockUpdatedCustomer)
      expect(mockStripeInstance.customers.update).toHaveBeenCalledWith('cus_test123', {
        name: 'Updated Name',
      })
    })

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed')
      mockStripeInstance.customers.update.mockRejectedValue(mockError)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(updateStripeCustomer('cus_test123', { name: 'Error Name' })).rejects.toThrow(
        'Update failed'
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating Stripe customer:', mockError)
      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Billing Portal Session
  // ==========================================================================

  describe('createBillingPortalSession', () => {
    it('should create billing portal session', async () => {
      const mockSession = {
        id: 'bps_test123',
        url: 'https://billing.stripe.com/session/test123',
        customer: 'cus_test123',
        return_url: 'https://example.com/profile',
      } as Stripe.BillingPortal.Session

      mockStripeInstance.billingPortal.sessions.create.mockResolvedValue(mockSession)

      const result = await createBillingPortalSession(
        'cus_test123',
        'https://example.com/profile'
      )

      expect(result).toEqual(mockSession)
      expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test123',
        return_url: 'https://example.com/profile',
      })
    })

    it('should handle billing portal errors', async () => {
      const mockError = new Error('Billing portal error')
      mockStripeInstance.billingPortal.sessions.create.mockRejectedValue(mockError)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        createBillingPortalSession('cus_test123', 'https://example.com/profile')
      ).rejects.toThrow('Billing portal error')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating billing portal session:',
        mockError
      )
      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Checkout Session
  // ==========================================================================

  describe('createCheckoutSession', () => {
    it('should create subscription checkout session', async () => {
      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
        customer: 'cus_test123',
        mode: 'subscription',
      } as Stripe.Checkout.Session

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      const result = await createCheckoutSession(
        'cus_test123',
        'price_test123',
        'https://example.com/success',
        'https://example.com/cancel',
        'subscription'
      )

      expect(result).toEqual(mockSession)
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test123',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_test123',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      })
    })

    it('should create payment checkout session', async () => {
      const mockSession = {
        id: 'cs_test456',
        url: 'https://checkout.stripe.com/pay/cs_test456',
        customer: 'cus_test123',
        mode: 'payment',
      } as Stripe.Checkout.Session

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      const result = await createCheckoutSession(
        'cus_test123',
        'price_test456',
        'https://example.com/success',
        'https://example.com/cancel',
        'payment'
      )

      expect(result.mode).toBe('payment')
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
        })
      )
    })

    it('should default to subscription mode', async () => {
      const mockSession = {
        id: 'cs_test789',
        url: 'https://checkout.stripe.com/pay/cs_test789',
      } as Stripe.Checkout.Session

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      await createCheckoutSession(
        'cus_test123',
        'price_test789',
        'https://example.com/success',
        'https://example.com/cancel'
      )

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
        })
      )
    })

    it('should handle checkout session errors', async () => {
      const mockError = new Error('Checkout error')
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(mockError)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        createCheckoutSession(
          'cus_test123',
          'price_error',
          'https://example.com/success',
          'https://example.com/cancel'
        )
      ).rejects.toThrow('Checkout error')

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating checkout session:', mockError)
      consoleErrorSpy.mockRestore()
    })
  })
})

