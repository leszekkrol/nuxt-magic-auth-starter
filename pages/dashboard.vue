<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-gray-500">Welcome back, {{ user?.name || 'User' }}!</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Profile Card -->
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
            {{ userInitials }}
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">{{ user?.name || 'User' }}</h3>
            <p class="text-sm text-gray-500">{{ user?.email }}</p>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100">
          <NuxtLink to="/profile" class="text-sm text-indigo-600 hover:text-indigo-500">
            Edit profile →
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h3 class="font-semibold text-gray-900 mb-4">Account Info</h3>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between">
            <dt class="text-gray-500">Member since</dt>
            <dd class="text-gray-900">{{ memberSince }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-gray-500">Auth method</dt>
            <dd class="text-gray-900">Magic Link</dd>
          </div>
        </dl>
      </div>

      <!-- Get Started -->
      <div class="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-sm">
        <h3 class="font-semibold mb-2">🚀 Get Started</h3>
        <p class="text-sm text-indigo-100 mb-4">
          This is your dashboard. Customize it to fit your app's needs.
        </p>
        <a 
          href="https://github.com/leszekkrol/nuxt-magic-auth-starter" 
          target="_blank"
          class="inline-flex items-center text-sm font-medium text-white hover:underline"
        >
          View documentation →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()

const userInitials = computed(() => {
  const name = user.value?.name || user.value?.email || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const memberSince = computed(() => {
  if (!user.value?.createdAt) return 'N/A'
  return new Date(user.value.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
})
</script>

