<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" :class="headerClasses">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white">
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
  hoverable?: boolean
}>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false
})

const cardClasses = computed(() => {
  const classes = [
    'bg-white dark:bg-gray-800',
    'rounded-lg'
  ]

  // Variant styles
  if (props.variant === 'bordered') {
    classes.push('border border-gray-200 dark:border-gray-700')
  } else if (props.variant === 'elevated') {
    classes.push('shadow-lg dark:shadow-xl')
  } else {
    classes.push('shadow-md')
  }

  // Hover effect
  if (props.hoverable) {
    classes.push('transition-shadow duration-200 hover:shadow-lg')
  }

  return classes.join(' ')
})

const headerClasses = computed(() => {
  const classes = ['border-b border-gray-200 dark:border-gray-700']

  if (props.padding === 'none') {
    classes.push('p-0')
  } else if (props.padding === 'sm') {
    classes.push('px-3 py-2')
  } else if (props.padding === 'md') {
    classes.push('px-4 py-3')
  } else {
    classes.push('px-6 py-4')
  }

  return classes.join(' ')
})

const bodyClasses = computed(() => {
  if (props.padding === 'none') {
    return 'p-0'
  } else if (props.padding === 'sm') {
    return 'p-3'
  } else if (props.padding === 'md') {
    return 'p-4'
  } else {
    return 'p-6'
  }
})

const footerClasses = computed(() => {
  const classes = ['border-t border-gray-200 dark:border-gray-700']

  if (props.padding === 'none') {
    classes.push('p-0')
  } else if (props.padding === 'sm') {
    classes.push('px-3 py-2')
  } else if (props.padding === 'md') {
    classes.push('px-4 py-3')
  } else {
    classes.push('px-6 py-4')
  }

  return classes.join(' ')
})
</script>
