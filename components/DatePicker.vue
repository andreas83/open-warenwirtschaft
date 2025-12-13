<template>
  <div class="mb-4">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        type="date"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :class="inputClasses"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
      />
      <div
        v-if="errorMessage"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <div class="i-mdi-alert-circle text-red-500 w-5 h-5" />
      </div>
    </div>
    <p
      v-if="hint && !errorMessage"
      :id="`${inputId}-hint`"
      class="mt-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ hint }}
    </p>
    <p
      v-if="errorMessage"
      :id="`${inputId}-error`"
      class="mt-1 text-sm text-red-600 dark:text-red-400"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  error?: string
  validator?: (value: string) => string | null
  min?: string
  max?: string
}>(), {
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = ref(`datepicker-${Math.random().toString(36).substr(2, 9)}`)
const touched = ref(false)
const localError = ref<string | null>(null)

const errorMessage = computed(() => {
  return props.error || (touched.value ? localError.value : null)
})

const inputClasses = computed(() => [
  'w-full px-3 py-2 rounded border transition-colors',
  errorMessage.value
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500',
  'bg-white dark:bg-gray-800',
  'text-gray-900 dark:text-gray-100',
  'focus:outline-none focus:ring-2',
  props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
])

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)

  if (touched.value && props.validator) {
    localError.value = props.validator(value)
  }
}

const handleBlur = () => {
  touched.value = true
  if (props.validator) {
    localError.value = props.validator(props.modelValue)
  }
}
</script>
