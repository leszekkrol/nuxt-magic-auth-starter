import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * Stripe subscription data structure
 */
export interface StripeSubscription {
  id: string
  status: string
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  items: {
    priceId: string
    productId: string | null
  }[]
}

/**
 * Subscription status response
 */
export interface SubscriptionStatus {
  hasSubscription: boolean
  subscription: StripeSubscription | null
  status: string | null
  allSubscriptions?: any[]
  message?: string
}

/**
 * useStripe composable state
 */
interface UseStripeState {
  subscription: Ref<StripeSubscription | null>
  loading: Ref<boolean>
  error: Ref<string | null>
}

// Shared state across component instances
const state: UseStripeState = {
  subscription: ref(null),
  loading: ref(false),
  error: ref(null)
}

/**
 * Composable for Stripe subscription management
 * Provides reactive access to user's subscription status
 */
export function useStripe() {
  const hasSubscription = computed(() => state.subscription.value !== null)
  
  const isActive = computed(() => {
    if (!state.subscription.value) return false
    return state.subscription.value.status === 'active' || state.subscription.value.status === 'trialing'
  })
  
  /**
   * Fetch subscription status from API
   */
  async function fetchSubscription(options?: { priceId?: string; productId?: string }): Promise<SubscriptionStatus> {
    state.loading.value = true
    state.error.value = null
    
    try {
      const query: Record<string, string> = {}
      if (options?.priceId) query.priceId = options.priceId
      if (options?.productId) query.productId = options.productId
      
      const queryString = Object.keys(query).length > 0 
        ? '?' + new URLSearchParams(query).toString() 
        : ''
      
      const response = await $fetch<SubscriptionStatus>(
        `/api/stripe/subscription${queryString}`
      )
      
      state.subscription.value = response.subscription
      return response
    } catch (err: any) {
      state.error.value = err.message || 'Failed to fetch subscription'
      state.subscription.value = null
      throw err
    } finally {
      state.loading.value = false
    }
  }
  
  /**
   * Check if user has specific price subscription
   */
  async function hasPrice(priceId: string): Promise<boolean> {
    try {
      const response = await fetchSubscription({ priceId })
      return response.hasSubscription
    } catch {
      return false
    }
  }
  
  /**
   * Check if user has specific product subscription
   */
  async function hasProduct(productId: string): Promise<boolean> {
    try {
      const response = await fetchSubscription({ productId })
      return response.hasSubscription
    } catch {
      return false
    }
  }
  
  /**
   * Clear subscription state
   */
  function clearSubscription() {
    state.subscription.value = null
    state.error.value = null
  }
  
  return {
    // State
    subscription: computed(() => state.subscription.value),
    loading: computed(() => state.loading.value),
    error: computed(() => state.error.value),
    hasSubscription,
    isActive,
    
    // Actions
    fetchSubscription,
    hasPrice,
    hasProduct,
    clearSubscription
  }
}
