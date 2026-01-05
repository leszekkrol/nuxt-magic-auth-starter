<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * App Root Component
 * 
 * Entry point for the Nuxt application.
 * Initializes authentication state on mount to restore sessions.
 */
const { refreshUser } = useAuth()

// Restore user session on app initialization
onMounted(() => {
  refreshUser()
})
</script>
