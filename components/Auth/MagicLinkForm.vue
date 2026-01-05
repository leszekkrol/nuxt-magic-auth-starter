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
/**
 * MagicLinkForm Component
 * 
 * Reusable form component for passwordless authentication via magic links.
 * Handles email input, validation, and submission to the auth API.
 * 
 * @emits success - When magic link is sent successfully (passes email)
 * @emits failed - When sending fails (passes error message)
 * 
 * @example
 * ```vue
 * <AuthMagicLinkForm
 *   title="Sign In"
 *   description="Enter your email to receive a magic link"
 *   @success="handleSuccess"
 * />
 * ```
 */

// Component props with sensible defaults
interface Props {
  /** Form title displayed above inputs */
  title?: string
  /** Description text below title */
  description?: string
  /** Whether to show optional name input field */
  showName?: boolean
  /** Submit button text */
  buttonText?: string
  /** Message shown on successful submission */
  successText?: string
  /** Default error message when submission fails */
  errorText?: string
  /** Route to redirect after success (not used internally) */
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

// Auth composable for API interaction
const { sendMagicLink, loading } = useAuth()

// Form state
const email = ref('')
const name = ref('')
const errorMessage = ref('')
const successMessage = ref('')

/**
 * Handles form submission
 * Sends magic link request and manages success/error states
 */
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
