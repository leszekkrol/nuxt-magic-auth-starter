<template>
  <div>
    <!-- Loading state -->
    <div v-if="loading" class="stripe-protected-loading">
      <slot name="loading">
        <AuthLoadingSpinner />
      </slot>
    </div>
    
    <!-- Has subscription - show protected content -->
    <div v-else-if="hasAccess" class="stripe-protected-content">
      <slot />
    </div>
    
    <!-- No subscription - show paywall -->
    <div v-else class="stripe-protected-paywall">
      <slot name="paywall">
        <div class="paywall-default">
          <h3 class="text-xl font-bold mb-4">🔒 Premium Content</h3>
          <p class="text-gray-600 mb-6">
            Subscribe to access this exclusive content
          </p>
          <button 
            @click="navigateToCheckout"
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </slot>
    </div>
    
    <!-- Error state -->
    <div v-if="error && !loading" class="stripe-protected-error">
      <slot name="error" :error="error">
        <p class="text-red-600">{{ error }}</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStripe } from '../../composables/useStripe'

/**
 * StripeProtectedContent Component
 * Shows content only to users with active Stripe subscription
 * 
 * @example
 * <StripeProtectedContent priceId="price_xxx">
 *   <p>Premium content here!</p>
 *   <template #paywall>
 *     <div>Custom paywall</div>
 *   </template>
 * </StripeProtectedContent>
 */

interface Props {
  /** Stripe price ID to check for (optional) */
  priceId?: string
  /** Stripe product ID to check for (optional) */
  productId?: string
  /** Custom checkout URL to navigate to */
  checkoutUrl?: string
  /** Auto-check subscription on mount (default: true) */
  autoCheck?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoCheck: true
})

const { 
  subscription, 
  loading, 
  error, 
  hasSubscription, 
  isActive,
  fetchSubscription,
  hasPrice,
  hasProduct
} = useStripe()

const hasAccess = ref(false)

// Check subscription status
async function checkAccess() {
  try {
    if (props.priceId) {
      hasAccess.value = await hasPrice(props.priceId)
    } else if (props.productId) {
      hasAccess.value = await hasProduct(props.productId)
    } else {
      await fetchSubscription()
      hasAccess.value = isActive.value
    }
  } catch (err) {
    hasAccess.value = false
  }
}

// Navigate to checkout or custom URL
function navigateToCheckout() {
  if (props.checkoutUrl) {
    navigateTo(props.checkoutUrl)
  } else if (props.priceId) {
    navigateTo(`/pricing?price=${props.priceId}`)
  } else {
    navigateTo('/pricing')
  }
}

// Check on mount if autoCheck is enabled
onMounted(() => {
  if (props.autoCheck) {
    checkAccess()
  }
})

// Expose refresh method
defineExpose({
  checkAccess,
  refresh: checkAccess
})
</script>

<style scoped>
.stripe-protected-loading,
.stripe-protected-content,
.stripe-protected-paywall,
.stripe-protected-error {
  width: 100%;
}

.paywall-default {
  text-align: center;
  padding: 3rem 1.5rem;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

@media (prefers-color-scheme: dark) {
  .paywall-default {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .paywall-default p {
    color: #9ca3af;
  }
}
</style>
