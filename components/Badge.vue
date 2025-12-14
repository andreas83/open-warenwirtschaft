<template>
  <span :class="badgeClasses">
    <div v-if="icon" :class="icon" class="w-3 h-3" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  icon?: string
}>(), {
  variant: 'default',
  size: 'md',
  rounded: true
})

const badgeClasses = computed(() => {
  const classes = ['inline-flex items-center gap-1 font-medium']

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  }
  classes.push(sizeClasses[props.size])

  // Rounded classes
  if (props.rounded) {
    classes.push('rounded-full')
  } else {
    classes.push('rounded')
  }

  // Variant colors
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    primary: 'bg-blue-600 text-white'
  }
  classes.push(variantClasses[props.variant])

  return classes.join(' ')
})
</script>
