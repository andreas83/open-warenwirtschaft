<template>
  <div class="mb-4">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
    </label>
    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        @change="handleChange"
        @blur="handleBlur"
        :required="required"
        :disabled="disabled"
        :class="selectClasses"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none"
      >
        <div class="i-mdi-chevron-down text-gray-400 w-5 h-5" />
      </div>
      <div
        v-if="errorMessage"
        class="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none"
      >
        <div class="i-mdi-alert-circle text-red-500 w-5 h-5" />
      </div>
    </div>
    <p
      v-if="hint && !errorMessage"
      :id="`${selectId}-hint`"
      class="mt-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ hint }}
    </p>
    <p
      v-if="errorMessage"
      :id="`${selectId}-error`"
      class="mt-1 text-sm text-red-600 dark:text-red-400"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
type Option = string | number | { [key: string]: any }

const props = withDefaults(defineProps<{
  modelValue: string | number | null
  label?: string
  options: Option[]
  valueKey?: string
  labelKey?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  error?: string
  validator?: (value: string | number | null) => string | null
}>(), {
  required: false,
  disabled: false,
  valueKey: 'value',
  labelKey: 'label'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const selectId = ref(`select-${Math.random().toString(36).substr(2, 9)}`)
const touched = ref(false)
const localError = ref<string | null>(null)

const errorMessage = computed(() => {
  return props.error || (touched.value ? localError.value : null)
})

const selectClasses = computed(() => [
  'w-full px-3 py-2 pr-10 rounded border transition-colors appearance-none',
  errorMessage.value
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500',
  'bg-white dark:bg-gray-800',
  'text-gray-900 dark:text-gray-100',
  'focus:outline-none focus:ring-2',
  props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
])

const getOptionValue = (option: Option): string | number => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

const getOptionLabel = (option: Option): string => {
  if (typeof option === 'object' && option !== null) {
    return option[props.labelKey]
  }
  return String(option)
}

const handleChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value
  const emitValue = value === '' ? null : (isNaN(Number(value)) ? value : Number(value))
  emit('update:modelValue', emitValue)

  if (touched.value && props.validator) {
    localError.value = props.validator(emitValue)
  }
}

const handleBlur = () => {
  touched.value = true
  if (props.validator) {
    localError.value = props.validator(props.modelValue)
  }
}
</script>
