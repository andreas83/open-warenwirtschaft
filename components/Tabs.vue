<template>
  <div>
    <div :class="tabListClasses" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id || index"
        @click="selectTab(index)"
        :class="getTabClasses(index)"
        role="tab"
        :aria-selected="activeTab === index"
        :aria-controls="`tabpanel-${tab.id || index}`"
      >
        <div v-if="tab.icon" :class="tab.icon" class="w-5 h-5" />
        {{ tab.label }}
        <Badge v-if="tab.badge" :variant="tab.badgeVariant || 'primary'" size="sm">
          {{ tab.badge }}
        </Badge>
      </button>
    </div>
    <div class="mt-4">
      <div
        v-for="(tab, index) in tabs"
        :key="`panel-${tab.id || index}`"
        v-show="activeTab === index"
        :id="`tabpanel-${tab.id || index}`"
        role="tabpanel"
      >
        <slot :name="`tab-${index}`" :tab="tab">
          {{ tab.content }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id?: string
  label: string
  icon?: string
  badge?: string | number
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
  content?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  tabs: Tab[]
  variant?: 'default' | 'pills' | 'underline'
  defaultTab?: number
}>(), {
  variant: 'default',
  defaultTab: 0
})

const emit = defineEmits<{
  'tab-change': [index: number, tab: Tab]
}>()

const activeTab = ref(props.defaultTab)

const tabListClasses = computed(() => {
  const base = 'flex gap-2'

  const variants = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    pills: '',
    underline: 'border-b border-gray-200 dark:border-gray-700'
  }

  return [base, variants[props.variant]]
})

const getTabClasses = (index: number) => {
  const base = [
    'flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  ]

  const isActive = activeTab.value === index
  const tab = props.tabs[index]

  if (tab.disabled) {
    return [
      ...base,
      'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'
    ]
  }

  const variants = {
    default: isActive
      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-b-2 hover:border-gray-300 dark:hover:border-gray-600',
    pills: isActive
      ? 'bg-blue-600 text-white rounded-lg'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg',
    underline: isActive
      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
  }

  return [
    ...base,
    variants[props.variant]
  ]
}

const selectTab = (index: number) => {
  if (props.tabs[index].disabled) return

  activeTab.value = index
  emit('tab-change', index, props.tabs[index])
}
</script>
