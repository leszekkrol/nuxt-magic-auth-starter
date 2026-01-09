import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// Mock modules
const mockAuthUtils = {
  requireUser: vi.fn(),
}

const mockStripeUtils = {
  getStripe: vi.fn(),
}

vi.mock('../../server/utils/auth', () => mockAuthUtils)
vi.mock('../../server/utils/stripe', () => mockStripeUtils)

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3') as any
  return {
    ...actual,
    getQuery: (event: any) => event._query || {},
  }
})

const mockConfig = {
  public: {
    appUrl: 'https://example.com',
  },
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

// Import handler after mocks
const subscriptionHandler = (await import('../../server/api/stripe/subscription.get')).default

describe('GET /api/stripe/subscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // No Stripe Customer
  // ==========================================================================

  describe('User without Stripe customer', () => {
    it('should return no subscription if user has no stripeCustomerId', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: null,
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)

      const mockEvent = {
        _query: {},
      }

      const result = await subscriptionHandler(mockEvent)

      expect(result).toEqual({
        hasSubscription: false,
        subscription: null,
        status: null,
      })
    })
  })

  // ==========================================================================
  // Active Subscriptions
  // ==========================================================================

  describe('Active subscriptions', () => {
    it('should return active subscription', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_end: 1234567890,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                id: 'price_test123',
                product: { id: 'prod_test123' },
              },
            },
          ],
        },
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockResolvedValue({
            data: [mockSubscription],
          }),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const mockEvent = {
        _query: {},
      }

      const result = await subscriptionHandler(mockEvent)

      expect(result.hasSubscription).toBe(true)
      expect(result.subscription).toBeDefined()
      expect(result.subscription?.id).toBe('sub_test123')
      expect(result.subscription?.status).toBe('active')
    })

    it('should return trialing subscription as active', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSubscription = {
        id: 'sub_trial',
        status: 'trialing',
        current_period_end: 1234567890,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                id: 'price_test123',
                product: 'prod_test123',
              },
            },
          ],
        },
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockResolvedValue({
            data: [mockSubscription],
          }),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const mockEvent = {
        _query: {},
      }

      const result = await subscriptionHandler(mockEvent)

      expect(result.hasSubscription).toBe(true)
      expect(result.status).toBe('trialing')
    })
  })

  // ==========================================================================
  // No Active Subscriptions
  // ==========================================================================

  describe('No active subscriptions', () => {
    it('should return false if all subscriptions are canceled', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSubscription = {
        id: 'sub_canceled',
        status: 'canceled',
        current_period_end: 1234567890,
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockResolvedValue({
            data: [mockSubscription],
          }),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const mockEvent = {
        _query: {},
      }

      const result = await subscriptionHandler(mockEvent)

      expect(result.hasSubscription).toBe(false)
      expect(result.subscription).toBeNull()
    })

    it('should return false if no subscriptions exist', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockResolvedValue({
            data: [],
          }),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const mockEvent = {
        _query: {},
      }

      const result = await subscriptionHandler(mockEvent)

      expect(result.hasSubscription).toBe(false)
    })
  })

  // ==========================================================================
  // Specific Price/Product Check
  // ==========================================================================

  describe('Specific price/product check', () => {
    it('should check for specific priceId', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_end: 1234567890,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                id: 'price_premium',
                product: { id: 'prod_test123' },
              },
            },
          ],
        },
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockResolvedValue({
            data: [mockSubscription],
          }),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const mockEvent = {
        _query: { priceId: 'price_premium' },
      }

      const result = await subscriptionHandler(mockEvent)

      expect(result.hasSubscription).toBe(true)
      expect(result.subscription?.items[0].priceId).toBe('price_premium')
    })

    it('should return false if priceId does not match', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_end: 1234567890,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                id: 'price_basic',
                product: { id: 'prod_test123' },
              },
            },
          ],
        },
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockResolvedValue({
            data: [mockSubscription],
          }),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const mockEvent = {
        _query: { priceId: 'price_premium' }, // Looking for different price
      }

      const result = await subscriptionHandler(mockEvent)

      // Should not find matching subscription for price_premium
      expect(result.hasSubscription).toBe(false)
      expect(result.subscription).toBeNull()
      expect(result.allSubscriptions).toBeDefined()
    })

    it('should check for specific productId', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockSubscription = {
        id: 'sub_test123',
        status: 'active',
        current_period_end: 1234567890,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                id: 'price_test123',
                product: { id: 'prod_premium' },
              },
            },
          ],
        },
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockResolvedValue({
            data: [mockSubscription],
          }),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const mockEvent = {
        _query: { productId: 'prod_premium' },
      }

      const result = await subscriptionHandler(mockEvent)

      expect(result.hasSubscription).toBe(true)
      expect(result.subscription?.items[0].productId).toBe('prod_premium')
    })
  })

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('Error handling', () => {
    it('should handle Stripe API errors', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        stripeCustomerId: 'cus_test123',
      }

      const mockStripe = {
        subscriptions: {
          list: vi.fn().mockRejectedValue(new Error('Stripe API error')),
        },
      }

      mockAuthUtils.requireUser.mockResolvedValue(mockUser)
      mockStripeUtils.getStripe.mockReturnValue(mockStripe)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const mockEvent = {
        _query: {},
      }

      await expect(subscriptionHandler(mockEvent)).rejects.toThrow(
        'Failed to fetch subscription status'
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
