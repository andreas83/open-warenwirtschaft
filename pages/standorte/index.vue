<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ $t('standorte.listTitle') }}</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">{{ $t('standorte.loadingLocations') }}</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="flex gap-2">
          <NuxtLink to="/standorte/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('standorte.newLocation') }}</NuxtLink>
          <button v-if="selectedType" @click="resetTypeFilter" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200">{{ $t('standorte.resetFilter') }} ({{ selectedType }})</button>
          <button @click="showFieldSelector = !showFieldSelector" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200" title="Select Visible Fields">
            <span class="i-mdi-filter-cog-outline w-5 h-5 "></span> 
          </button>
        </div>
        <div v-if="showFieldSelector" class="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <h3 class="text-lg font-semibold mb-2">{{ $t('standorte.selectVisibleFields') }}</h3>
          <div v-for="(visible, field) in fieldVisibility" :key="field" class="flex items-center mb-2">
            <input type="checkbox" v-model="fieldVisibility[field]" class="mr-2">
            <label class="text-sm text-gray-700">{{ field }}</label>
          </div>
          <button @click="showFieldSelector = false" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('standorte.close') }}</button>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="searchQuery" type="text" :placeholder="$t('standorte.searchPlaceholder')" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="debouncedSearch" ref="searchInput" autofocus>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm whitespace-nowrap">{{ $t('standorte.entriesPerPage') }}</span>
            <select v-model="itemsPerPage" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @change="fetchStandorte">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="standort in paginatedStandorte" :key="standort.StandortID" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col gap-2">
              <h3 v-if="fieldVisibility.Name" class="text-lg font-semibold text-gray-800">{{ standort.Name }}</h3>
              <p v-if="fieldVisibility.Adresse || fieldVisibility.Ort || fieldVisibility.Land || fieldVisibility.PLZ" class="text-gray-600 text-sm">
                <span v-if="fieldVisibility.Adresse">{{ standort.Adresse || $t('standorte.noAddress') }}</span>
                <span v-if="fieldVisibility.Adresse && (fieldVisibility.Ort || fieldVisibility.Land || fieldVisibility.PLZ)">, </span>
                <span v-if="fieldVisibility.PLZ">{{ standort.PLZ || 'N/A' }}</span>
                <span v-if="fieldVisibility.PLZ && (fieldVisibility.Ort || fieldVisibility.Land)">, </span>
                <span v-if="fieldVisibility.Ort">{{ standort.Ort || $t('standorte.noCity') }}</span>
                <span v-if="fieldVisibility.Ort && fieldVisibility.Land">, </span>
                <span v-if="fieldVisibility.Land">{{ standort.Land || $t('standorte.noCountry') }}</span>
              </p>
              <p v-if="fieldVisibility.Telefon || fieldVisibility.Email" class="text-gray-600 text-sm">
                <span v-if="fieldVisibility.Telefon">{{ $t('standorte.phone') }}: {{ standort.Telefon || 'N/A' }}</span>
                <span v-if="fieldVisibility.Telefon && fieldVisibility.Email">, </span>
                <span v-if="fieldVisibility.Email">{{ $t('standorte.email') }}: {{ standort.Email || 'N/A' }}</span>
              </p>
              <div v-if="fieldVisibility.Typ" class="flex items-center gap-2">
                <span class="text-gray-500 text-xs">{{ $t('standorte.type') }}</span>
                <span class="text-blue-600 text-sm font-medium cursor-pointer hover:underline" @click="filterByType(standort.Typ)">{{ standort.Typ }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/standorte/edit/${standort.StandortID}`" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200 transition duration-200 text-sm">{{ $t('standorte.edit') }}</NuxtLink>
              <button @click="deleteStandort(standort.StandortID)" class="bg-red-100 text-red-800 px-3 py-1 rounded-lg hover:bg-red-200 transition duration-200 text-sm">{{ $t('standorte.delete') }}</button>
            </div>
          </div>
        </div>
        <div v-if="paginatedStandorte.length === 0" class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
          {{ $t('standorte.noLocationsFound') }}
        </div>
      </div>
      <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="text-gray-600 text-sm">
          {{ $t('standorte.showingEntries', { start: startIndex + 1, end: endIndex, total: filteredStandorte.length }) }}
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <button :disabled="currentPage === 1" @click="currentPage -= 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('standorte.previous') }}</button>
          <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'" class="px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200">{{ page }}</button>
          <button :disabled="currentPage === totalPages" @click="currentPage += 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('standorte.next') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const standorte = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const sortKey = ref('StandortID')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedType = ref('')
const showFieldSelector = ref(false)
const fieldVisibility = ref({
  Name: true,
  Adresse: true,
  Ort: true,
  Land: true,
  PLZ: true,
  Telefon: true,
  Email: true,
  Typ: true
})
let searchTimeout = null

// Fetch Standorte from API
async function fetchStandorte() {
  try {
    loading.value = true
    const limit = itemsPerPage.value
    const offset = (currentPage.value - 1) * itemsPerPage.value
    let url = `/api/standorte?limit=${limit}&offset=${offset}`
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    standorte.value = response
  } catch (err) {
    error.value = $t('standorte.errorLoadingLocations') + err.message
  } finally {
    loading.value = false
  }
}

// Delete a Standort
async function deleteStandort(id) {
  if (confirm($t('standorte.confirmDeleteLocation'))) {
    try {
      await $fetch(`/api/standorte?id=${id}`, { method: 'DELETE' })
      standorte.value = standorte.value.filter(s => s.StandortID !== id)
    } catch (err) {
      alert($t('standorte.errorDeletingLocation') + err.message)
    }
  }
}

// Debounced search to prevent excessive API calls
function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1 // Reset to first page on new search
    fetchStandorte() // Fetch new data from API with search query
  }, 500)
}

// Sort function for table headers
function sort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  standorte.value.sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]
    if (typeof valueA === 'string') {
      return sortOrder.value === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    } else {
      return sortOrder.value === 'asc' ? valueA - valueB : valueB - valueA
    }
  })
}

// Computed properties for pagination and filtering
const filteredStandorte = computed(() => {
  if (selectedType.value) {
    return standorte.value.filter(s => s.Typ === selectedType.value)
  }
  return [...standorte.value]
})

// Function to filter by type
function filterByType(type) {
  selectedType.value = type
  currentPage.value = 1
}

// Function to reset type filter
function resetTypeFilter() {
  selectedType.value = ''
  currentPage.value = 1
}

const totalPages = computed(() => Math.ceil(filteredStandorte.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredStandorte.value.length))
const paginatedStandorte = computed(() => filteredStandorte.value.slice(startIndex.value, endIndex.value))

// Watch for page changes to fetch data
watch(currentPage, () => {
  fetchStandorte()
})

// Initial fetch on component mount and focus on search input
onMounted(() => {
  fetchStandorte();
  if (searchInput.value) {
    searchInput.value.focus();
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
.rotate-180 {
  transform: rotate(180deg);
  display: inline-block;
}
</style>
