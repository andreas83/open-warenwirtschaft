<template>
  <div>
    <!-- Tab Headers -->
    <div
      :class="[
        'flex border-b',
        variant === 'underline' ? 'border-gray-200' : 'border-transparent gap-1'
      ]"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        @click="selectTab(tab.value)"
        :disabled="tab.disabled"
        :class="[
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          variant === 'underline' ? getUnderlineClasses(tab) : getPillClasses(tab),
          tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
      >
        <span v-if="tab.icon" :class="[tab.icon, 'w-4 h-4']"></span>
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge !== undefined"
          :class="[
            'ml-2 px-2 py-0.5 text-xs rounded-full',
            modelValue === tab.value
              ? 'bg-white/20 text-white'
              : 'bg-gray-200 text-gray-600'
          ]"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- Tab Content -->
    <div :class="['mt-4', contentClass]">
      <slot :name="modelValue"></slot>
      <slot v-if="!$slots[modelValue]"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  value: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

interface Props {
  modelValue: string
  tabs: Tab[]
  variant?: 'underline' | 'pills'
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'underline',
  contentClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

function selectTab(value: string) {
  const tab = props.tabs.find(t => t.value === value)
  if (tab?.disabled) return

  emit('update:modelValue', value)
  emit('change', value)
}

function getUnderlineClasses(tab: Tab): string {
  const base = 'px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px'

  if (props.modelValue === tab.value) {
    return `${base} border-indigo-600 text-indigo-600`
  }
  return `${base} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
}

function getPillClasses(tab: Tab): string {
  const base = 'px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2'

  if (props.modelValue === tab.value) {
    return `${base} bg-indigo-600 text-white`
  }
  return `${base} bg-gray-100 text-gray-600 hover:bg-gray-200`
}
</script>
