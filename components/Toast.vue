<template>
  <Transition name="toast">
    <div
      v-if="visible"
      :class="[
        'fixed z-50 px-6 py-4 rounded-lg shadow-lg max-w-md',
        'transition-all duration-300 ease-in-out',
        typeClasses,
        positionClasses
      ]"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="flex items-start gap-3">
        <div :class="iconClasses" class="flex-shrink-0 w-5 h-5" />
        <div class="flex-1">
          <h4 v-if="title" class="font-semibold mb-1">{{ title }}</h4>
          <p class="text-sm">{{ message }}</p>
        </div>
        <button
          v-if="dismissible"
          @click="close"
          class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          :aria-label="$t('common.close')"
        >
          <div class="i-mdi-close w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  message: string
  title?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
  duration?: number
  dismissible?: boolean
}>(), {
  type: 'info',
  position: 'top-right',
  duration: 4000,
  dismissible: true
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

const typeClasses = computed(() => {
  const classes = {
    success: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
  }
  return classes[props.type]
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

const positionClasses = computed(() => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }
  return positions[props.position]
})

const show = () => {
  visible.value = true
  if (props.duration > 0) {
    timeout = setTimeout(() => {
      close()
    }, props.duration)
  }
}

const close = () => {
  visible.value = false
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  emit('close')
}

onMounted(() => {
  show()
})

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})

defineExpose({
  close
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-1rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}
</style>
