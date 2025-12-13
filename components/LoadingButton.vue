<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="i-mdi-loading animate-spin w-5 h-5 mr-2" />
    <div v-else-if="icon" :class="icon" class="w-5 h-5 mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  loading?: boolean
  disabled?: boolean
  icon?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  type: 'button',
  variant: 'primary',
  loading: false,
  disabled: false,
  size: 'md'
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = [
    'inline-flex items-center justify-center',
    'rounded font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2'
  ]

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  const variants = {
    primary: [
      'bg-blue-600 text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
      'disabled:bg-blue-300 disabled:cursor-not-allowed'
    ],
    secondary: [
      'bg-gray-200 dark:bg-gray-700',
      'text-gray-900 dark:text-gray-100',
      'hover:bg-gray-300 dark:hover:bg-gray-600',
      'focus:ring-gray-500',
      'disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed'
    ],
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
      'disabled:bg-red-300 disabled:cursor-not-allowed'
    ],
    success: [
      'bg-green-600 text-white',
      'hover:bg-green-700',
      'focus:ring-green-500',
      'disabled:bg-green-300 disabled:cursor-not-allowed'
    ]
  }

  return [
    ...base,
    sizes[props.size],
    ...variants[props.variant]
  ].join(' ')
})
</script>
