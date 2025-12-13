<template>
  <span :class="badgeClasses">
    <div v-if="icon" :class="icon" class="w-3 h-3" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  rounded?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  rounded: false
})

const badgeClasses = computed(() => {
  const base = [
    'inline-flex items-center gap-1 font-medium',
    props.rounded ? 'rounded-full' : 'rounded'
  ]

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const variants = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300'
  }

  return [
    ...base,
    sizes[props.size],
    variants[props.variant]
  ]
})
</script>
