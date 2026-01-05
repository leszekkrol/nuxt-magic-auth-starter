<template>
  <div class="text-center">
    <!-- Loading state -->
    <template v-if="loading">
      <AuthLoadingSpinner size="lg" class="mb-4" />
      <h1 class="text-xl font-semibold text-gray-900">Verifying your link...</h1>
      <p class="text-gray-500 mt-2">Please wait while we sign you in</p>
    </template>

    <!-- Error state -->
    <template v-else-if="error">
      <div class="rounded-full bg-red-100 p-4 inline-block mb-4">
        <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 class="text-xl font-semibold text-gray-900">Verification Failed</h1>
      <p class="text-gray-500 mt-2">{{ error }}</p>
      <NuxtLink 
        to="/login" 
        class="mt-6 inline-flex items-center text-indigo-600 hover:text-indigo-500"
      >
        ← Try again
      </NuxtLink>
    </template>

    <!-- Success state -->
    <template v-else-if="success">
      <div class="rounded-full bg-green-100 p-4 inline-block mb-4">
        <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="text-xl font-semibold text-gray-900">
        {{ isNewUser ? 'Welcome!' : 'Welcome back!' }}
      </h1>
      <p class="text-gray-500 mt-2">Redirecting to dashboard...</p>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * Verify Page
 * 
 * Handles magic link token verification.
 * Accessed via email link with token query parameter.
 * 
 * Flow:
 * 1. Extract token from URL
 * 2. Verify token with API
 * 3. Show success/error and redirect
 */
definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const { verifyToken } = useAuth()

// Page state
const loading = ref(true)
const error = ref('')
const success = ref(false)
const isNewUser = ref(false)

/**
 * Verify token on page mount
 * Automatically extracts token from URL query
 */
onMounted(async () => {
  const token = route.query.token as string
  
  // Validate token presence
  if (!token) {
    error.value = 'No verification token provided'
    loading.value = false
    return
  }

  try {
    const result = await verifyToken(token)
    success.value = true
    isNewUser.value = result.isNewUser
    
    // Redirect to dashboard or original destination after delay
    setTimeout(() => {
      const redirect = route.query.redirect as string
      router.push(redirect || '/dashboard')
    }, 1500)
  } catch (err: any) {
    error.value = err.message || 'Failed to verify token'
  } finally {
    loading.value = false
  }
})
</script>
