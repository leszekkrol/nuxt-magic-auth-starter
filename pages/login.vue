<template>
  <AuthMagicLinkForm 
    title="Sign in to your account"
    description="Enter your email and we'll send you a magic link"
    @success="onSuccess" 
  />
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

