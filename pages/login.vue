<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 text-center mb-2">
      Sign in to your account
    </h1>
    <p class="text-gray-500 text-center mb-8">
      Enter your email and we'll send you a magic link
    </p>
    
    <AuthMagicLinkForm @success="onSuccess" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

function onSuccess(email: string) {
  // Optional: track success analytics
  console.log('Magic link sent to:', email)
}
</script>

