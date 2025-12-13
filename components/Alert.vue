<template>
  <div
    v-if="!dismissed"
    :class="alertClasses"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <div :class="iconClasses" class="flex-shrink-0 w-5 h-5 mt-0.5" />
      <div class="flex-1">
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
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message?: string
  dismissible?: boolean
}>(), {
  type: 'info',
  dismissible: false
})

const emit = defineEmits<{
  dismiss: []
}>()

const dismissed = ref(false)

const alertClasses = computed(() => {
  const base = [
    'rounded-lg border p-4 mb-4'
  ]

  const types = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
  }

  return [
    ...base,
    types[props.type]
  ]
})

const iconClasses = computed(() => {
  const icons = {
    success: 'i-mdi-check-circle text-green-600 dark:text-green-400',
    error: 'i-mdi-alert-circle text-red-600 dark:text-red-400',
    warning: 'i-mdi-alert text-yellow-600 dark:text-yellow-400',
    info: 'i-mdi-information text-blue-600 dark:text-blue-400'
  }

  return icons[props.type]
})

const dismiss = () => {
  dismissed.value = true
  emit('dismiss')
}
</script>
