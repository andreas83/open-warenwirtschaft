<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {{ title }}
      </h3>
      <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400">
        {{ description }}
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 dark:border-gray-700">
      <button
        @click="activeTab = 'preview'"
        :class="[
          'flex-1 px-6 py-3 text-sm font-medium transition-colors',
          activeTab === 'preview'
            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        ]"
      >
        <div class="flex items-center justify-center gap-2">
          <div class="i-mdi-eye w-4 h-4" />
          {{ $t('components.demo.preview') }}
        </div>
      </button>
      <button
        @click="activeTab = 'code'"
        :class="[
          'flex-1 px-6 py-3 text-sm font-medium transition-colors',
          activeTab === 'code'
            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
            : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        ]"
      >
        <div class="flex items-center justify-center gap-2">
          <div class="i-mdi-code-tags w-4 h-4" />
          {{ $t('components.demo.code') }}
        </div>
      </button>
    </div>

    <!-- Content -->
    <div class="bg-white dark:bg-gray-800">
      <!-- Preview Tab -->
      <div v-show="activeTab === 'preview'" class="p-6">
        <slot name="preview" />
      </div>

      <!-- Code Tab -->
      <div v-show="activeTab === 'code'" class="relative">
        <button
          @click="copyCode"
          class="absolute top-4 right-4 p-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          :class="{ 'bg-green-600 hover:bg-green-600': copied }"
          :title="$t('components.demo.copyCode')"
        >
          <div v-if="copied" class="i-mdi-check w-5 h-5" />
          <div v-else class="i-mdi-content-copy w-5 h-5" />
        </button>
        <pre class="p-6 overflow-x-auto text-sm"><code class="text-gray-800 dark:text-gray-200"><slot name="code" /></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()

const activeTab = ref<'preview' | 'code'>('preview')
const copied = ref(false)

const slots = useSlots()

const copyCode = async () => {
  const codeSlot = slots.code?.()
  if (codeSlot && codeSlot[0]?.children) {
    const code = typeof codeSlot[0].children === 'string'
      ? codeSlot[0].children
      : String(codeSlot[0].children)

    try {
      await navigator.clipboard.writeText(code.trim())
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }
}
</script>
