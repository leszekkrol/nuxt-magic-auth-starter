<template>
  <div>
    <h1 v-if="title" class="text-2xl font-bold text-gray-900 text-center mb-2">
      {{ title }}
    </h1>
    <p v-if="description" class="text-gray-500 text-center mb-8">
      {{ description }}
    </p>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        :disabled="loading"
        class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="you@example.com"
      />
    </div>

    <div v-if="showName">
      <label for="name" class="block text-sm font-medium text-gray-700">
        Name (optional)
      </label>
      <input
        id="name"
        v-model="name"
        type="text"
        :disabled="loading"
        class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="John Doe"
      />
    </div>

    <div v-if="errorMessage" class="rounded-lg bg-red-50 p-4 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="rounded-lg bg-green-50 p-4 text-sm text-green-700">
      {{ successMessage }}
    </div>

    <button
      type="submit"
      :disabled="loading || !email"
      class="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
    >
      <AuthLoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
      {{ loading ? 'Sending...' : buttonText }}
    </button>
    </form>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  showName?: boolean
  buttonText?: string
  successText?: string
  errorText?: string
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  showName: false,
  buttonText: 'Send Magic Link',
  successText: 'Check your email for the magic link!',
  errorText: 'Failed to send magic link',
  redirectTo: ''
})

const emit = defineEmits<{
  success: [email: string]
  failed: [message: string]
}>()

const { sendMagicLink, loading } = useAuth()

const email = ref('')
const name = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await sendMagicLink(email.value, { name: name.value || undefined })
    successMessage.value = props.successText
    emit('success', email.value)
  } catch (err: any) {
    errorMessage.value = err.message || props.errorText
    emit('failed', errorMessage.value)
  }
}
</script>

