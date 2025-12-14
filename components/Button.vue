<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses,
      variantClasses,
      { 'opacity-60 cursor-not-allowed': disabled || loading }
    ]"
  >
    <span v-if="loading" class="i-svg-spinners-ring-resize w-4 h-4" />
    <span v-else-if="icon" :class="[icon, iconSizeClass]" />
    <span v-if="$slots.default"><slot /></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'link' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-lg'
  }
  return [sizes[props.size], props.block ? 'w-full' : '']
})

const iconSizeClass = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
    secondary: 'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 focus:ring-primary-500 shadow-sm',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-sm',
    info: 'bg-info-600 text-white hover:bg-info-700 focus:ring-info-500 shadow-sm',
    ghost: 'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
    link: 'text-primary-600 hover:text-primary-800 hover:underline focus:ring-primary-500 p-0'
  }
  return variants[props.variant]
})
</script>
