<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation bar -->
    <nav class="border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo and navigation links -->
          <div class="flex items-center gap-8">
            <NuxtLink to="/" class="flex items-center gap-2">
              <span class="text-2xl">🪄</span>
              <span class="font-bold text-gray-900">MagicAuth</span>
            </NuxtLink>
            
            <!-- Main navigation (visible to authenticated users) -->
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

          <!-- User menu or login button -->
          <div class="flex items-center gap-4">
            <AuthUserMenu v-if="isLoggedIn" />
            <AuthLoginButton v-else />
          </div>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * Default Layout
 * 
 * Main application layout with navigation bar.
 * Includes responsive navigation with:
 * - Logo linking to home
 * - Dashboard link (authenticated users only)
 * - User menu dropdown or login button
 */
const { isLoggedIn } = useAuth()
</script>
