<template>
  <NuxtLink
    :to="to"
    class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition"
    :class="buttonClass"
  >
    <slot>Sign In</slot>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

const props = withDefaults(defineProps<Props>(), {
  to: '/login',
  variant: 'primary'
})

const buttonClass = computed(() => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
  return variants[props.variant]
})
</script>

