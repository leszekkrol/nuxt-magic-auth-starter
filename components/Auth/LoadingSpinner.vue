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
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  label?: string
  containerClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  containerClass: ''
})

const sizeClass = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  return sizes[props.size]
})

const colorClass = computed(() => {
  const colors = {
    primary: 'text-indigo-600',
    white: 'text-white',
    gray: 'text-gray-500'
  }
  return colors[props.color]
})
</script>

