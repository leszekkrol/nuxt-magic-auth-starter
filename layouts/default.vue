<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center gap-8">
            <NuxtLink to="/" class="flex items-center gap-2">
              <span class="text-2xl">🪄</span>
              <span class="font-bold text-gray-900">MagicAuth</span>
            </NuxtLink>
            
            <div class="hidden sm:flex items-center gap-4">
              <NuxtLink 
                v-if="isLoggedIn" 
                to="/dashboard" 
                class="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </NuxtLink>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <AuthUserMenu v-if="isLoggedIn" />
            <AuthLoginButton v-else />
          </div>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()
</script>

