<template>
  <nav aria-label="Breadcrumb" class="mb-4">
    <ol class="flex items-center gap-2 text-sm">
      <li v-for="(crumb, index) in crumbs" :key="index" class="flex items-center gap-2">
        <NuxtLink
          v-if="crumb.to && index < crumbs.length - 1"
          :to="crumb.to"
          class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {{ crumb.label }}
        </NuxtLink>
        <span
          v-else
          class="text-gray-900 dark:text-gray-100 font-medium"
          :aria-current="index === crumbs.length - 1 ? 'page' : undefined"
        >
          {{ crumb.label }}
        </span>
        <div
          v-if="index < crumbs.length - 1"
          class="i-mdi-chevron-right text-gray-400 dark:text-gray-600 w-4 h-4"
        />
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface Breadcrumb {
  label: string
  to?: string
}

defineProps<{
  crumbs: Breadcrumb[]
}>()
</script>
