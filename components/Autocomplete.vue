<template>
  <div class="relative">
    <input
      :id="id"
      v-model="searchValue"
      @input="handleInput"
      @focus="handleFocus"
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
      class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
    >
    <svg class="absolute right-10 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
    <svg v-if="searchValue || selectedItem" @click="clearSelection()" class="absolute right-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
    <div v-if="isDropdownOpen && filteredItems.length > 0" class="absolute mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
      <div
        v-for="item in filteredItems"
        :key="item[idKey]"
        @click="selectItem(item)"
        class="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer text-gray-700 dark:text-gray-300 text-sm transition-all duration-150"
      >
        {{ props.displayFn(item) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Suchen...'
  },
  items: {
    type: Array,
    required: true
  },
  idKey: {
    type: String,
    required: true
  },
  displayFn: {
    type: Function,
    required: true
  },
  filterFn: {
    type: Function,
    required: true
  },
  initialValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['select'])

const searchValue = ref(props.initialValue)
const filteredItems = ref([])
const isDropdownOpen = ref(false)
const selectedItem = ref(null)

function filterItems() {
  if (searchValue.value) {
    filteredItems.value = props.items.filter(item => props.filterFn(item, searchValue.value))
  } else {
    filteredItems.value = props.items
  }
}

function handleInput() {
  filterItems()
  isDropdownOpen.value = true
  emit('input', searchValue.value)
}

function handleFocus() {
  filterItems()
  isDropdownOpen.value = true
}

function selectItem(item) {
  searchValue.value = props.displayFn(item)
  selectedItem.value = item
  isDropdownOpen.value = false
  filteredItems.value = []
  emit('select', item)
}

function clearSelection() {
  searchValue.value = ''
  selectedItem.value = null
  isDropdownOpen.value = false
  filteredItems.value = []
  emit('select', null)
}


onMounted(() => {
  searchValue.value = props.initialValue
})

watch(() => props.initialValue, (newValue) => {
  searchValue.value = newValue
  if (!newValue) {
    selectedItem.value = null
  }
})

watch(() => props.items, () => {
  filterItems()
  // Only open dropdown if there is a search value or user interaction
  if (searchValue.value && filteredItems.value.length === 0 && props.items.length > 0) {
    filteredItems.value = props.items
    isDropdownOpen.value = true
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
