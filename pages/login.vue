<template>
  <AuthMagicLinkForm 
    title="Sign in to your account"
    description="Enter your email and we'll send you a magic link"
    @success="onSuccess" 
  />
</template>

<script setup lang="ts">
/**
 * Login Page
 * 
 * Passwordless authentication entry point.
 * Uses auth layout for centered card styling.
 * Protected by guest middleware (redirects authenticated users).
 */
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

/**
 * Handles successful magic link submission
 * Can be extended for analytics or additional logic
 */
function onSuccess(email: string) {
  console.log('Magic link sent to:', email)
}
</script>
