<template>
  <div>
    <slot v-if="isLoggedIn" />
    <slot v-else name="fallback">
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="rounded-full bg-gray-100 p-4 mb-4">
          <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
        <p class="text-gray-500 mb-6">Please sign in to access this content.</p>
        <AuthLoginButton variant="primary">Sign In</AuthLoginButton>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()
</script>

