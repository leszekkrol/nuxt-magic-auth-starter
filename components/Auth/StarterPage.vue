<template>
  <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <!-- Hero Section -->
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        <span class="text-5xl sm:text-7xl">🪄</span>
        <br />
        Magic Link Authentication
      </h1>
      <p class="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
        Passwordless login system for Nuxt.js. Simple, secure, and ready to deploy.
        No more forgotten passwords!
      </p>
      <div class="mt-10 flex items-center justify-center gap-4">
        <AuthLoginButton v-if="!isLoggedIn" variant="primary">
          Get Started
        </AuthLoginButton>
        <NuxtLink 
          v-else
          to="/dashboard"
          class="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Go to Dashboard
        </NuxtLink>
        <a
          href="https://github.com/leszekkrol/nuxt-magic-auth-starter"
          target="_blank"
          class="rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200"
        >
          View on GitHub
        </a>
      </div>
    </div>

    <!-- Features -->
    <div class="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-xl">
          🔐
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Passwordless Auth</h3>
        <p class="mt-2 text-sm text-gray-500">
          No passwords to remember. Users sign in with a magic link sent to their email.
        </p>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-xl">
          ⚡
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Ready to Use</h3>
        <p class="mt-2 text-sm text-gray-500">
          Clone, configure, and deploy. All the boilerplate is already done for you.
        </p>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-xl">
          📧
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Multiple Email Providers</h3>
        <p class="mt-2 text-sm text-gray-500">
          Console (dev), Resend, or SMTP/Nodemailer. Choose what works for you.
        </p>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-xl">
          🛡️
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Secure by Default</h3>
        <p class="mt-2 text-sm text-gray-500">
          JWT tokens, httpOnly cookies, rate limiting, and hashed tokens.
        </p>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-xl">
          🎨
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Beautiful UI</h3>
        <p class="mt-2 text-sm text-gray-500">
          Pre-built components with Tailwind CSS. Fully customizable.
        </p>
      </div>

      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-xl">
          🧪
        </div>
        <h3 class="mt-4 font-semibold text-gray-900">Fully Tested</h3>
        <p class="mt-2 text-sm text-gray-500">
          93+ unit tests with Vitest. Production-ready from day one.
        </p>
      </div>
    </div>

    <!-- Tech Stack -->
    <div class="mt-24 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Built With</h2>
      <div class="flex flex-wrap items-center justify-center gap-8 text-gray-500">
        <span class="text-lg font-medium">Nuxt 4</span>
        <span>•</span>
        <span class="text-lg font-medium">Prisma 7</span>
        <span>•</span>
        <span class="text-lg font-medium">Tailwind CSS</span>
        <span>•</span>
        <span class="text-lg font-medium">TypeScript</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isLoggedIn } = useAuth()
</script>

