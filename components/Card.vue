<template>
  <div :class="cardClasses">
    <div v-if="title || $slots.header" :class="headerClasses">
      <slot name="header">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
      </slot>
    </div>
    <div :class="bodyClasses">
      <slot />
    </div>
    <div v-if="$slots.footer" :class="footerClasses">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}>(), {
  variant: 'default',
  padding: 'md',
  hover: false
})

const slots = useSlots()

const cardClasses = computed(() => {
  const base = ['rounded-lg']

  const variants = {
    default: 'bg-white dark:bg-gray-800',
    bordered: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg'
  }

  const hover = props.hover
    ? 'transition-shadow hover:shadow-xl'
    : ''

  return [
    ...base,
    variants[props.variant],
    hover
  ]
})

const headerClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  }

  return [
    paddings[props.padding],
    'border-b border-gray-200 dark:border-gray-700'
  ]
})

const bodyClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }

  return paddings[props.padding]
})

const footerClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  }

  return [
    paddings[props.padding],
    'border-t border-gray-200 dark:border-gray-700',
    'bg-gray-50 dark:bg-gray-900/50'
  ]
})
</script>
