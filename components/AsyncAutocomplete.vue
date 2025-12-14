<template>
  <div class="relative" ref="containerRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        autocomplete="off"
        @input="handleInput"
        @focus="handleFocus"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.escape="closeDropdown"
        :class="[
          'w-full px-3 py-2 pr-10 border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
          error ? 'border-red-300' : 'border-gray-300'
        ]"
      />

      <!-- Icons -->
      <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <span v-if="loading" class="i-svg-spinners-ring-resize w-4 h-4 text-indigo-600"></span>
        <button
          v-else-if="selectedItem && clearable"
          type="button"
          @click.stop="clearSelection"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span class="i-mdi-close w-4 h-4"></span>
        </button>
        <span v-else class="i-mdi-magnify w-4 h-4 text-gray-400"></span>
      </div>
    </div>

    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen && (items.length > 0 || loading || noResultsText)"
        class="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-auto"
      >
        <!-- Loading State -->
        <div v-if="loading && items.length === 0" class="px-4 py-3 text-center">
          <LoadingSpinner size="sm" :text="loadingText" />
        </div>

        <!-- No Results -->
        <div
          v-else-if="!loading && items.length === 0 && searchQuery.length >= minChars"
          class="px-4 py-3 text-sm text-gray-500 text-center"
        >
          {{ noResultsText }}
        </div>

        <!-- Min chars hint -->
        <div
          v-else-if="!loading && items.length === 0 && searchQuery.length < minChars"
          class="px-4 py-3 text-sm text-gray-500 text-center"
        >
          {{ minCharsText.replace('{n}', String(minChars)) }}
        </div>

        <!-- Results -->
        <div v-else>
          <div
            v-for="(item, index) in items"
            :key="getItemKey(item)"
            @click="selectItem(item)"
            @mouseenter="highlightedIndex = index"
            :class="[
              'px-4 py-2.5 cursor-pointer transition-colors duration-150 text-sm',
              highlightedIndex === index ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <slot name="item" :item="item" :highlighted="highlightedIndex === index">
              {{ displayFn(item) }}
            </slot>
          </div>

          <!-- Load More -->
          <div
            v-if="hasMore"
            @click="$emit('load-more')"
            class="px-4 py-2 text-center text-sm text-indigo-600 hover:bg-indigo-50 cursor-pointer border-t"
          >
            {{ loadMoreText }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: any
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  hint?: string
  error?: string
  items?: any[]
  loading?: boolean
  itemKey?: string
  displayFn?: (item: any) => string
  debounce?: number
  minChars?: number
  noResultsText?: string
  loadingText?: string
  minCharsText?: string
  loadMoreText?: string
  hasMore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Suchen...',
  clearable: true,
  items: () => [],
  loading: false,
  itemKey: 'id',
  displayFn: (item: any) => item?.name ?? item?.label ?? String(item),
  debounce: 300,
  minChars: 2,
  noResultsText: 'Keine Ergebnisse gefunden',
  loadingText: 'Suche...',
  minCharsText: 'Mindestens {n} Zeichen eingeben',
  loadMoreText: 'Mehr laden...',
  hasMore: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  search: [query: string]
  select: [item: any]
  clear: []
  'load-more': []
}>()

const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const selectedItem = ref<any>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Initialize with model value
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedItem.value = newVal
    searchQuery.value = props.displayFn(newVal)
  } else {
    selectedItem.value = null
    if (!isOpen.value) {
      searchQuery.value = ''
    }
  }
}, { immediate: true })

// Reset highlight when items change
watch(() => props.items, () => {
  highlightedIndex.value = -1
})

function getItemKey(item: any): string | number {
  return item[props.itemKey] ?? item
}

function handleInput() {
  isOpen.value = true
  highlightedIndex.value = -1

  // Clear selection when typing
  if (selectedItem.value && searchQuery.value !== props.displayFn(selectedItem.value)) {
    selectedItem.value = null
    emit('update:modelValue', null)
  }

  // Debounced search
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  if (searchQuery.value.length >= props.minChars) {
    debounceTimer = setTimeout(() => {
      emit('search', searchQuery.value)
    }, props.debounce)
  }
}

function handleFocus() {
  isOpen.value = true
  if (searchQuery.value.length >= props.minChars) {
    emit('search', searchQuery.value)
  }
}

function closeDropdown() {
  isOpen.value = false
  highlightedIndex.value = -1

  // Restore selected value if exists
  if (selectedItem.value) {
    searchQuery.value = props.displayFn(selectedItem.value)
  }
}

function selectItem(item: any) {
  selectedItem.value = item
  searchQuery.value = props.displayFn(item)
  isOpen.value = false
  highlightedIndex.value = -1

  emit('update:modelValue', item)
  emit('select', item)
}

function selectHighlighted() {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < props.items.length) {
    selectItem(props.items[highlightedIndex.value])
  }
}

function clearSelection() {
  selectedItem.value = null
  searchQuery.value = ''
  isOpen.value = false

  emit('update:modelValue', null)
  emit('clear')

  inputRef.value?.focus()
}

function navigateDown() {
  if (!isOpen.value) {
    isOpen.value = true
    return
  }

  if (highlightedIndex.value < props.items.length - 1) {
    highlightedIndex.value++
  }
}

function navigateUp() {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  }
}

// Close on click outside
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      closeDropdown()
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  })
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
