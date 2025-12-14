<template>
  <div
    v-if="!dismissed"
    :class="alertClasses"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="flex items-start gap-3">
      <div :class="iconClasses" class="flex-shrink-0 w-5 h-5 mt-0.5" />
      <div class="flex-1 min-w-0">
        <h4 v-if="title" class="font-semibold mb-1">{{ title }}</h4>
        <div class="text-sm">
          <slot>{{ message }}</slot>
        </div>
      </div>
      <button
        v-if="dismissible"
        @click="dismiss"
        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        :aria-label="$t('common.close')"
      >
        <div class="i-mdi-close w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  message?: string
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  variant?: 'filled' | 'outlined' | 'soft'
  dismissible?: boolean
}>(), {
  type: 'info',
  variant: 'soft',
  dismissible: false
})

const emit = defineEmits<{
  dismiss: []
}>()

const dismissed = ref(false)

const alertClasses = computed(() => {
  const baseClasses = ['rounded-lg p-4 border']

  // Type-based colors
  const typeColors = {
    filled: {
      success: 'bg-green-600 text-white border-green-600',
      error: 'bg-red-600 text-white border-red-600',
      warning: 'bg-yellow-600 text-white border-yellow-600',
      info: 'bg-blue-600 text-white border-blue-600'
    },
    outlined: {
      success: 'bg-transparent text-green-700 dark:text-green-400 border-green-500',
      error: 'bg-transparent text-red-700 dark:text-red-400 border-red-500',
      warning: 'bg-transparent text-yellow-700 dark:text-yellow-400 border-yellow-500',
      info: 'bg-transparent text-blue-700 dark:text-blue-400 border-blue-500'
    },
    soft: {
      success: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
      error: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
      warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
      info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
    }
  }

  baseClasses.push(typeColors[props.variant][props.type])

  return baseClasses.join(' ')
})

const iconClasses = computed(() => {
  const icons = {
    success: 'i-mdi-check-circle text-green-600 dark:text-green-400',
    error: 'i-mdi-alert-circle text-red-600 dark:text-red-400',
    warning: 'i-mdi-alert text-yellow-600 dark:text-yellow-400',
    info: 'i-mdi-information text-blue-600 dark:text-blue-400'
  }

  // Override colors for filled variant
  if (props.variant === 'filled') {
    return `${icons[props.type].split(' ')[0]} text-white`
  }

  return icons[props.type]
})

const dismiss = () => {
  dismissed.value = true
  emit('dismiss')
}
</script>
