<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-4xl w-full">
      <div class="bg-white rounded-lg shadow-xl p-8 md:p-12">
        <div class="text-center mb-8">
          <h1 class="text-5xl font-bold text-gray-900 mb-4">
            🪄 Magic Link Auth Starter
          </h1>
          <p class="text-xl text-gray-600">
            Passwordless authentication for Nuxt.js
          </p>
        </div>
        
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-6">
            Welcome to the Magic Link Authentication Starter for Nuxt.js! 
            This starter provides a complete passwordless authentication system 
            using email-based magic links.
          </p>
          
          <div class="grid md:grid-cols-2 gap-6 mt-8">
            <div class="p-6 bg-blue-50 rounded-lg">
              <h3 class="text-xl font-semibold mb-3">✨ Features</h3>
              <ul class="list-disc list-inside space-y-2 text-gray-700">
                <li>Magic link authentication</li>
                <li>JWT token management</li>
                <li>Email provider agnostic</li>
                <li>TypeScript support</li>
                <li>Tailwind CSS styling</li>
              </ul>
            </div>
            
            <div class="p-6 bg-indigo-50 rounded-lg">
              <h3 class="text-xl font-semibold mb-3">🚀 Quick Start</h3>
              <ol class="list-decimal list-inside space-y-2 text-gray-700">
                <li>Configure your database</li>
                <li>Set up environment variables</li>
                <li>Choose email provider</li>
                <li>Run migrations</li>
                <li>Start developing!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Magic Link Auth Starter',
  description: 'Passwordless authentication starter for Nuxt.js'
})
</script>

