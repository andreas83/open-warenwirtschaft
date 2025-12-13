<template>
  <section :id="id" class="scroll-mt-8">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="flex items-center gap-3 mb-6">
        <div :class="icon" class="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
      </div>
      <div class="space-y-8">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  title: string
  icon: string
}>()
</script>
