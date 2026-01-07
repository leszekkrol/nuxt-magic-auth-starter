import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// Mock modules
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
}

const mockStripeUtils = {
  createBillingPortalSession: vi.fn(),
  createCheckoutSession: vi.fn(),
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}

const mockAuthUtils = {
  requireUser: vi.fn(),
}

vi.mock('../../server/utils/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('../../server/utils/stripe', () => mockStripeUtils)

vi.mock('../../server/utils/auth', () => mockAuthUtils)

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3') as any
  return {
    ...actual,
    readBody: async (event: any) => event._body || {},
    readRawBody: async (event: any) => {
      if (!event.node?.req?.method) {
        event.node = {
          req: { method: 'POST', headers: event.node?.req?.headers || {} },
          res: {}
        }
      }
      return event._rawBody || ''
    },
  }
})

const mockConfig = {
  public: {
    appUrl: 'https://example.com',
  },
  stripeWebhookSecret: 'whsec_test_secret',
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
  ;(globalThis as any).defineEventHandler = (handler: any) => handler
})

// Import handlers after mocks
const billingPortalHandler = (await import('../../server/api/stripe/billing-portal.post')).default
const checkoutHandler = (await import('../../server/api/stripe/checkout.post')).default

describe('Stripe API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Billing Portal Endpoint
  // ==========================================================================

  describe('POST /api/stripe/billing-portal', () => {
    it('should create billing portal session for authenticated user', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSession = {
        url: 'https://billing.stripe.com/session/test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.createBillingPortalSession.mockResolvedValue(mockSession)

      const mockEvent = {
        _body: { returnUrl: 'https://example.com/custom-return' },
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      const result = await billingPortalHandler(mockEvent)

      expect(result).toEqual({
        success: true,
        url: 'https://billing.stripe.com/session/test123',
      })

      expect(mockAuthUtils.requireUser).toHaveBeenCalledWith(mockEvent)
      expect(mockStripeUtils.createBillingPortalSession).toHaveBeenCalledWith(
        'cus_test123',
        'https://example.com/custom-return'
      )
    })

    it('should use default return URL when not provided', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSession = {
        url: 'https://billing.stripe.com/session/test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.createBillingPortalSession.mockResolvedValue(mockSession)

      const mockEvent = {
        _body: {},
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await billingPortalHandler(mockEvent)

      expect(mockStripeUtils.createBillingPortalSession).toHaveBeenCalledWith(
        'cus_test123',
        'https://example.com/profile'
      )
    })

    it('should throw error when user has no Stripe customer ID', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)

      const mockEvent = {
        _body: {},
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await expect(billingPortalHandler(mockEvent)).rejects.toThrow(
        'User does not have a Stripe customer ID'
      )
    })

    it('should handle Stripe errors', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.createBillingPortalSession.mockRejectedValue(
        new Error('Stripe API error')
      )

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockEvent = {
        _body: {},
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await expect(billingPortalHandler(mockEvent)).rejects.toThrow(
        'Failed to create billing portal session'
      )

      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Checkout Endpoint
  // ==========================================================================

  describe('POST /api/stripe/checkout', () => {
    it('should create checkout session for authenticated user', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.createCheckoutSession.mockResolvedValue(mockSession)

      const mockEvent = {
        _body: {
          priceId: 'price_test123',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
          mode: 'subscription',
        },
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      const result = await checkoutHandler(mockEvent)

      expect(result).toEqual({
        success: true,
        url: 'https://checkout.stripe.com/pay/cs_test123',
        sessionId: 'cs_test123',
      })

      expect(mockAuthUtils.requireUser).toHaveBeenCalledWith(mockEvent)
      expect(mockStripeUtils.createCheckoutSession).toHaveBeenCalledWith(
        'cus_test123',
        'price_test123',
        'https://example.com/success',
        'https://example.com/cancel',
        'subscription'
      )
    })

    it('should use default URLs when not provided', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.createCheckoutSession.mockResolvedValue(mockSession)

      const mockEvent = {
        _body: {
          priceId: 'price_test123',
        },
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await checkoutHandler(mockEvent)

      expect(mockStripeUtils.createCheckoutSession).toHaveBeenCalledWith(
        'cus_test123',
        'price_test123',
        'https://example.com/dashboard?checkout=success',
        'https://example.com/dashboard?checkout=cancelled',
        'subscription'
      )
    })

    it('should throw validation error when priceId is missing', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)

      const mockEvent = {
        _body: {},
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await expect(checkoutHandler(mockEvent)).rejects.toThrow('Invalid input data')
    })

    it('should throw validation error when priceId is empty string', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)

      const mockEvent = {
        _body: { priceId: '' },
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await expect(checkoutHandler(mockEvent)).rejects.toThrow('Invalid input data')
    })

    it('should throw error when user has no Stripe customer ID', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)

      const mockEvent = {
        _body: { priceId: 'price_test123' },
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await expect(checkoutHandler(mockEvent)).rejects.toThrow(
        'User does not have a Stripe customer ID'
      )
    })

    it('should support payment mode', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSession = {
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/pay/cs_test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.createCheckoutSession.mockResolvedValue(mockSession)

      const mockEvent = {
        _body: {
          priceId: 'price_test123',
          mode: 'payment',
        },
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await checkoutHandler(mockEvent)

      expect(mockStripeUtils.createCheckoutSession).toHaveBeenCalledWith(
        'cus_test123',
        'price_test123',
        expect.any(String),
        expect.any(String),
        'payment'
      )
    })

    it('should handle Stripe errors', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.createCheckoutSession.mockRejectedValue(new Error('Stripe API error'))

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockEvent = {
        _body: { priceId: 'price_test123' },
        node: {
          req: { method: 'POST', headers: {} },
          res: {}
        }
      }

      await expect(checkoutHandler(mockEvent)).rejects.toThrow(
        'Failed to create checkout session'
      )

      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // Webhook Endpoint
  // ==========================================================================

  describe('POST /api/stripe/webhook', () => {
    it('should handle subscription created event', async () => {
      const webhookHandler = (await import('../../server/api/stripe/webhook.post')).default

      const mockEvent = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test123',
            customer: 'cus_test123',
            status: 'active',
          },
        },
      }

      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn(() => mockEvent),
        },
      }

      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const mockHttpEvent = {
        _rawBody: JSON.stringify(mockEvent),
        node: {
          req: {
            method: 'POST',
            headers: {
              'stripe-signature': 'test_signature',
            },
          },
          res: {}
        },
      }

      const result = await webhookHandler(mockHttpEvent)

      expect(result).toEqual({ received: true })
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        JSON.stringify(mockEvent),
        'test_signature',
        'whsec_test_secret'
      )

      consoleLogSpy.mockRestore()
    })

    it('should reject webhook with invalid signature', async () => {
      const webhookHandler = (await import('../../server/api/stripe/webhook.post')).default

      const mockStripe = {
        webhooks: {
          constructEvent: vi.fn(() => {
            throw new Error('Invalid signature')
          }),
        },
      }

      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockHttpEvent = {
        _rawBody: JSON.stringify({ test: 'data' }),
        node: {
          req: {
            method: 'POST',
            headers: {
              'stripe-signature': 'invalid_signature',
            },
          },
          res: {}
        },
      }

      await expect(webhookHandler(mockHttpEvent)).rejects.toThrow('Invalid signature')

      consoleErrorSpy.mockRestore()
    })

    it('should reject webhook without signature', async () => {
      const webhookHandler = (await import('../../server/api/stripe/webhook.post')).default

      const mockHttpEvent = {
        _rawBody: JSON.stringify({ test: 'data' }),
        node: {
          req: {
            method: 'POST',
            headers: {},
          },
          res: {}
        },
      }

      await expect(webhookHandler(mockHttpEvent)).rejects.toThrow('Missing body or signature')
    })

    it('should reject webhook without body', async () => {
      const webhookHandler = (await import('../../server/api/stripe/webhook.post')).default

      const mockHttpEvent = {
        _rawBody: null,
        node: {
          req: {
            method: 'POST',
            headers: {
              'stripe-signature': 'test_signature',
            },
          },
          res: {}
        },
      }

      await expect(webhookHandler(mockHttpEvent)).rejects.toThrow('Missing body or signature')
    })
  })
})

