<template>
  <div class="relative" ref="menuRef">
    <!-- Menu trigger button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
    >
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        {{ userInitials }}
      </div>
      <span class="hidden sm:block">{{ displayName }}</span>
      <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu with animation -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
      >
        <!-- User info header -->
        <div class="px-4 py-3 border-b border-gray-100">
          <p class="text-sm font-medium text-gray-900">{{ displayName }}</p>
          <p class="text-sm text-gray-500 truncate">{{ user?.email }}</p>
        </div>
        
        <!-- Navigation links -->
        <div class="py-1">
          <NuxtLink
            to="/dashboard"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="isOpen = false"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/profile"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            @click="isOpen = false"
          >
            Profile
          </NuxtLink>
        </div>

        <!-- Logout action -->
        <div class="border-t border-gray-100 py-1">
          <button
            @click="handleLogout"
            :disabled="loading"
            class="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <AuthLoadingSpinner v-if="loading" size="sm" class="mr-2" />
            Sign out
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * UserMenu Component
 * 
 * Dropdown menu displaying authenticated user info and navigation.
 * Shows user avatar (initials), name, and provides access to:
 * - Dashboard
 * - Profile
 * - Logout action
 * 
 * Features:
 * - Click-outside to close
 * - Smooth open/close animations
 * - Responsive (hides name on mobile)
 * - Loading state during logout
 */
import { onClickOutside } from '@vueuse/core'

const { user, logout, loading } = useAuth()
const router = useRouter()

// Menu element ref for click-outside detection
const menuRef = ref<HTMLElement>()
const isOpen = ref(false)

// Close menu when clicking outside
onClickOutside(menuRef, () => {
  isOpen.value = false
})

/**
 * Display name with fallback
 */
const displayName = computed(() => user.value?.name || 'User')

/**
 * Generates user initials from name or email
 * Takes first letter of each word, max 2 characters
 */
const userInitials = computed(() => {
  const name = user.value?.name || user.value?.email || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

/**
 * Handles logout with navigation to home page
 */
async function handleLogout() {
  try {
    await logout()
    isOpen.value = false
    router.push('/')
  } catch (err) {
    console.error('Logout failed:', err)
  }
}
</script>
