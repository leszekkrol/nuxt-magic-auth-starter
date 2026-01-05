<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div 
      class="animate-spin rounded-full border-2 border-current border-t-transparent"
      :class="[sizeClass, colorClass]"
      role="status"
      aria-label="Loading"
    />
    <span v-if="label" class="ml-2 text-sm" :class="colorClass">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * LoadingSpinner Component
 * 
 * Accessible loading indicator with customizable size, color, and optional label.
 * Uses CSS animation for smooth rotation.
 * 
 * @example
 * ```vue
 * <!-- Simple spinner -->
 * <AuthLoadingSpinner />
 * 
 * <!-- With label -->
 * <AuthLoadingSpinner label="Loading..." />
 * 
 * <!-- Custom size and color -->
 * <AuthLoadingSpinner size="lg" color="white" />
 * ```
 */
interface Props {
  /** Spinner size: 'sm' (16px), 'md' (24px), 'lg' (32px) */
  size?: 'sm' | 'md' | 'lg'
  /** Color theme */
  color?: 'primary' | 'white' | 'gray'
  /** Optional text label next to spinner */
  label?: string
  /** Additional CSS classes for container */
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  containerClass: ''
})

/**
 * Maps size prop to Tailwind dimension classes
 */
const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  return sizes[props.size]
})

/**
 * Maps color prop to Tailwind text color classes
 */
const colorClass = computed(() => {
  const colors = {
    primary: 'text-indigo-600',
    white: 'text-white',
    gray: 'text-gray-500'
  }
  return colors[props.color]
})
</script>
