<template>
  <div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Profile</h1>
      <p class="mt-2 text-gray-500">Manage your account settings</p>
    </div>

    <div class="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
      <!-- Profile Info -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
            {{ userInitials }}
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ user?.name || 'User' }}</h2>
            <p class="text-gray-500">{{ user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Account Details -->
      <div class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <p class="text-gray-900">{{ user?.email }}</p>
          <p class="text-xs text-gray-500 mt-1">Your email is used for authentication</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <p class="text-gray-900">{{ user?.name || 'Not set' }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Member since</label>
          <p class="text-gray-900">{{ memberSince }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">User ID</label>
          <p class="text-gray-500 text-sm font-mono">{{ user?.id }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100">
        <button
          @click="handleLogout"
          :disabled="loading"
          class="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          <AuthLoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const { user, logout, loading } = useAuth()

const userInitials = computed(() => {
  const name = user.value?.name || user.value?.email || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const memberSince = computed(() => {
  if (!user.value?.createdAt) return 'N/A'
  return new Date(user.value.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

