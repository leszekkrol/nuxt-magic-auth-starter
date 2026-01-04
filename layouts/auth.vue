<template>
  <div class="flex min-h-screen flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <div class="mx-auto w-full max-w-md px-4">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <span class="text-4xl">🪄</span>
          <span class="text-2xl font-bold text-gray-900">MagicAuth</span>
        </NuxtLink>
      </div>
      
      <div class="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
        <slot />
      </div>
      
      <p class="mt-8 text-center text-sm text-gray-500">
        <NuxtLink to="/" class="hover:text-indigo-600">← Back to home</NuxtLink>
      </p>
    </div>
  </div>
</template>

