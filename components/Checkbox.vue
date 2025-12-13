<template>
  <div class="flex items-start">
    <div class="flex items-center h-5">
      <input
        :id="checkboxId"
        type="checkbox"
        :checked="modelValue"
        @change="handleChange"
        :disabled="disabled"
        :class="checkboxClasses"
        :aria-describedby="hint ? `${checkboxId}-hint` : undefined"
      />
    </div>
    <div class="ml-3 text-sm">
      <label
        :for="checkboxId"
        :class="labelClasses"
      >
        {{ label }}
        <span v-if="required" class="text-red-500 ml-1" aria-label="required">*</span>
      </label>
      <p
        v-if="hint"
        :id="`${checkboxId}-hint`"
        class="text-gray-500 dark:text-gray-400"
      >
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  label: string
  hint?: string
  disabled?: boolean
  required?: boolean
}>(), {
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxId = ref(`checkbox-${Math.random().toString(36).substr(2, 9)}`)

const checkboxClasses = computed(() => [
  'w-4 h-4 rounded border-gray-300 dark:border-gray-600',
  'text-blue-600 focus:ring-blue-500 focus:ring-2',
  'transition-colors',
  'bg-white dark:bg-gray-800',
  props.disabled && 'opacity-50 cursor-not-allowed'
])

const labelClasses = computed(() => [
  'font-medium text-gray-700 dark:text-gray-300',
  props.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
])

const handleChange = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  emit('update:modelValue', checked)
}
</script>
