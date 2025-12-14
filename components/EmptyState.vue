<template>
  <div :class="containerClasses">
    <div :class="iconClasses" />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="flex flex-wrap gap-3 justify-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  icon?: string
  iconSize?: 'sm' | 'md' | 'lg'
}>(), {
  icon: 'i-mdi-inbox',
  iconSize: 'lg'
})

const containerClasses = computed(() => [
  'flex flex-col items-center justify-center',
  'text-center py-12 px-4'
])

const iconClasses = computed(() => {
  const classes = [props.icon, 'text-gray-400 dark:text-gray-600 mb-4']

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }
  classes.push(sizeClasses[props.iconSize])

  return classes.join(' ')
})
</script>
