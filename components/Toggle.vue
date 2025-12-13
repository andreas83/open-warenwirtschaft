<template>
  <div class="flex items-center justify-between" :class="containerClass">
    <div class="flex-1" v-if="label || hint">
      <label
        v-if="label"
        :for="toggleId"
        class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {{ label }}
        <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
      </label>
      <p v-if="hint" class="text-sm text-gray-500 dark:text-gray-400">
        {{ hint }}
      </p>
    </div>
    <button
      :id="toggleId"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      @click="toggle"
      :class="toggleClasses"
    >
      <span :class="thumbClasses" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  disabled: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggleId = ref(`toggle-${Math.random().toString(36).substr(2, 9)}`)

const containerClass = computed(() => {
  if (props.label || props.hint) {
    return 'mb-4'
  }
  return ''
})

const toggleClasses = computed(() => {
  const sizes = {
    sm: 'w-9 h-5',
    md: 'w-11 h-6',
    lg: 'w-14 h-7'
  }

  return [
    'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    sizes[props.size],
    props.modelValue
      ? 'bg-blue-600'
      : 'bg-gray-200 dark:bg-gray-700',
    props.disabled && 'opacity-50 cursor-not-allowed'
  ]
})

const thumbClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const translate = {
    sm: props.modelValue ? 'translate-x-4' : 'translate-x-0',
    md: props.modelValue ? 'translate-x-5' : 'translate-x-0',
    lg: props.modelValue ? 'translate-x-7' : 'translate-x-0'
  }

  return [
    'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
    sizes[props.size],
    translate[props.size]
  ]
})

const toggle = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>
