<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses" />
    <p v-if="text" :class="textClasses">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  center?: boolean
  overlay?: boolean
}>(), {
  size: 'md',
  center: false,
  overlay: false
})

const containerClasses = computed(() => {
  const classes = ['flex flex-col items-center gap-3']

  if (props.center) {
    classes.push('justify-center min-h-[200px]')
  }

  if (props.overlay) {
    classes.push('fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-50 justify-center')
  }

  return classes.join(' ')
})

const spinnerClasses = computed(() => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return [
    'border-4 rounded-full animate-spin',
    'border-gray-200 dark:border-gray-700',
    'border-t-blue-600 dark:border-t-blue-400',
    sizeMap[props.size]
  ].join(' ')
})

const textClasses = computed(() => {
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return [
    'text-gray-600 dark:text-gray-400',
    sizeMap[props.size]
  ].join(' ')
})
</script>
