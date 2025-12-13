<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-2 mt-6"
    role="navigation"
    aria-label="Pagination"
  >
    <!-- First Page -->
    <button
      v-if="showFirstLast"
      @click="$emit('update:page', 1)"
      :disabled="currentPage === 1"
      :class="buttonClasses"
      :aria-label="$t('common.firstPage')"
      class="px-3 py-2"
    >
      <div class="i-mdi-chevron-double-left w-5 h-5" />
    </button>

    <!-- Previous Page -->
    <button
      @click="$emit('update:page', currentPage - 1)"
      :disabled="currentPage === 1"
      :class="buttonClasses"
      :aria-label="$t('common.previousPage')"
      class="px-3 py-2"
    >
      <div class="i-mdi-chevron-left w-5 h-5" />
    </button>

    <!-- Page Numbers -->
    <template v-for="page in displayedPages" :key="page">
      <span v-if="page === 'ellipsis'" class="px-2 text-gray-500 dark:text-gray-400">
        ...
      </span>
      <button
        v-else
        @click="$emit('update:page', page)"
        :class="[
          'min-w-[40px] px-3 py-2 rounded transition-colors',
          page === currentPage
            ? 'bg-blue-600 text-white font-semibold'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
        :aria-label="`${$t('common.page')} ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
      >
        {{ page }}
      </button>
    </template>

    <!-- Next Page -->
    <button
      @click="$emit('update:page', currentPage + 1)"
      :disabled="currentPage === totalPages"
      :class="buttonClasses"
      :aria-label="$t('common.nextPage')"
      class="px-3 py-2"
    >
      <div class="i-mdi-chevron-right w-5 h-5" />
    </button>

    <!-- Last Page -->
    <button
      v-if="showFirstLast"
      @click="$emit('update:page', totalPages)"
      :disabled="currentPage === totalPages"
      :class="buttonClasses"
      :aria-label="$t('common.lastPage')"
      class="px-3 py-2"
    >
      <div class="i-mdi-chevron-double-right w-5 h-5" />
    </button>
  </nav>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  currentPage: number
  totalPages: number
  maxVisible?: number
  showFirstLast?: boolean
}>(), {
  maxVisible: 7,
  showFirstLast: true
})

defineEmits<{
  'update:page': [page: number]
}>()

const buttonClasses = computed(() => [
  'rounded transition-colors',
  'bg-gray-100 dark:bg-gray-700',
  'text-gray-700 dark:text-gray-300',
  'hover:bg-gray-200 dark:hover:bg-gray-600',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700'
])

const displayedPages = computed(() => {
  const pages: (number | 'ellipsis')[] = []
  const { currentPage, totalPages, maxVisible } = props

  if (totalPages <= maxVisible) {
    // Show all pages if total is less than maxVisible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    const leftBound = Math.max(2, currentPage - 1)
    const rightBound = Math.min(totalPages - 1, currentPage + 1)

    // Add ellipsis after first page if needed
    if (leftBound > 2) {
      pages.push('ellipsis')
    }

    // Add pages around current page
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (rightBound < totalPages - 1) {
      pages.push('ellipsis')
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }
  }

  return pages
})
</script>
