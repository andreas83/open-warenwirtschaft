<template>
  <div class="mb-4">
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
    </label>
    <div :class="inline ? 'flex gap-4' : 'space-y-2'">
      <div
        v-for="option in options"
        :key="getOptionValue(option)"
        class="flex items-center"
      >
        <input
          :id="`${radioId}-${getOptionValue(option)}`"
          type="radio"
          :name="name || radioId"
          :value="getOptionValue(option)"
          :checked="modelValue === getOptionValue(option)"
          @change="handleChange"
          :disabled="disabled"
          :class="radioClasses"
        />
        <label
          :for="`${radioId}-${getOptionValue(option)}`"
          :class="labelClasses"
        >
          {{ getOptionLabel(option) }}
        </label>
      </div>
    </div>
    <p
      v-if="hint"
      class="mt-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
type Option = string | number | { [key: string]: any }

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: Option[]
  label?: string
  name?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  inline?: boolean
  valueKey?: string
  labelKey?: string
}>(), {
  disabled: false,
  required: false,
  inline: false,
  valueKey: 'value',
  labelKey: 'label'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const radioId = ref(`radio-${Math.random().toString(36).substr(2, 9)}`)

const radioClasses = computed(() => [
  'w-4 h-4 border-gray-300 dark:border-gray-600',
  'text-blue-600 focus:ring-blue-500 focus:ring-2',
  'transition-colors',
  'bg-white dark:bg-gray-800',
  props.disabled && 'opacity-50 cursor-not-allowed'
])

const labelClasses = computed(() => [
  'ml-2 text-sm font-medium text-gray-700 dark:text-gray-300',
  props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
])

const getOptionValue = (option: Option): string | number => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

const getOptionLabel = (option: Option): string => {
  if (typeof option === 'object' && option !== null) {
    return String(option[props.labelKey])
  }
  return String(option)
}

const handleChange = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  const numValue = Number(value)
  const finalValue = isNaN(numValue) ? value : numValue
  emit('update:modelValue', finalValue)
}
</script>
