<template>
  <div
    :class="[
      'px-4 py-3 rounded-lg shadow-lg max-w-sm min-w-72 border-l-4',
      'transition-all duration-300 ease-in-out',
      typeClasses,
      { 'opacity-0': !visible }
    ]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="flex items-start gap-3">
      <div :class="[iconClasses, 'flex-shrink-0 w-5 h-5 mt-0.5']" />
      <div class="flex-1 min-w-0">
        <h4 v-if="title" class="font-semibold text-sm mb-0.5">{{ title }}</h4>
        <p class="text-sm opacity-90">{{ message }}</p>
      </div>
      <button
        v-if="dismissible"
        @click="$emit('close')"
        class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity -mt-0.5 -mr-1"
        :aria-label="$t('common.close')"
      >
        <div class="i-mdi-close w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  message: string
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  dismissible?: boolean
  visible?: boolean
}>(), {
  type: 'info',
  dismissible: true,
  visible: true
})

defineEmits<{
  close: []
}>()

const typeClasses = computed(() => {
  const classes = {
    success: 'bg-success-50 text-success-900 border-success-500',
    error: 'bg-danger-50 text-danger-900 border-danger-500',
    warning: 'bg-warning-50 text-warning-900 border-warning-500',
    info: 'bg-info-50 text-info-900 border-info-500'
  }
  return classes[props.type]
})

const iconClasses = computed(() => {
  const icons = {
    success: 'i-mdi-check-circle text-success-600',
    error: 'i-mdi-close-circle text-danger-600',
    warning: 'i-mdi-alert-circle text-warning-600',
    info: 'i-mdi-information text-info-600'
  }
  return icons[props.type]
})
</script>
