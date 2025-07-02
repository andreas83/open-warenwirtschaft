<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Umsatzsteuersätze Liste</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">Lade Umsatzsteuersätze...</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div>
          <NuxtLink to="/umsatzsteuersaetze/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">Neuer Umsatzsteuersatz</NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="searchQuery" type="text" placeholder="Suche nach Name..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="debouncedSearch" ref="searchInput" autofocus>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm whitespace-nowrap">Einträge pro Seite:</span>
            <select v-model="itemsPerPage" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @change="fetchUmsatzsteuersaetze">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="satz in paginatedUmsatzsteuersaetze" :key="satz.id" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-gray-800">{{ satz.name }}</h3>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-xs">Steuersatz:</span>
                  <span class="text-blue-600 text-sm font-medium">{{ satz.steuersatz }} %</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/umsatzsteuersaetze/edit/${satz.id}`" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200 transition duration-200 text-sm">Bearbeiten</NuxtLink>
              <button @click="deleteSatz(satz.id)" class="bg-red-100 text-red-800 px-3 py-1 rounded-lg hover:bg-red-200 transition duration-200 text-sm">Löschen</button>
            </div>
          </div>
        </div>
        <div v-if="paginatedUmsatzsteuersaetze.length === 0" class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
          Keine Umsatzsteuersätze gefunden, die den Suchkriterien entsprechen.
        </div>
      </div>
      <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="text-gray-600 text-sm">
          Zeige {{ startIndex + 1 }} bis {{ endIndex }} von {{ totalItems }} Einträgen
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <button :disabled="currentPage === 1" @click="currentPage = 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">Erste</button>
          <button :disabled="currentPage === 1" @click="currentPage -= 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">Vorherige</button>
          <button v-if="startPage > 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200" @click="currentPage = startPage - 1">...</button>
          <button v-for="page in pageRange" :key="page" @click="currentPage = page" :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'" class="px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200">{{ page }}</button>
          <button v-if="endPage < totalPages" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200" @click="currentPage = endPage + 1">...</button>
          <button :disabled="currentPage === totalPages" @click="currentPage += 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">Nächste</button>
          <button :disabled="currentPage === totalPages" @click="currentPage = totalPages" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">Letzte</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const umsatzsteuersaetze = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
let searchTimeout = null

// Fetch Umsatzsteuersätze from API
async function fetchUmsatzsteuersaetze() {
  try {
    loading.value = true
    const limit = itemsPerPage.value
    const offset = (currentPage.value - 1) * itemsPerPage.value
    let url = `/api/umsatzsteuersaetze?limit=${limit}&offset=${offset}`
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await fetch(url)
    if (!response.ok) throw new Error('Fehler beim Laden der Umsatzsteuersätze')
    const data = await response.json()
    if (Array.isArray(data)) {
      umsatzsteuersaetze.value = data.map(item => ({
        id: item.UmsatzsteuersatzID,
        name: item.Name,
        steuersatz: item.Steuersatz
      }))
      totalItems.value = data.length || 0
    } else {
      umsatzsteuersaetze.value = []
      totalItems.value = 0
      error.value = 'Keine Umsatzsteuersätze gefunden oder ungültige Antwort vom Server.'
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Umsatzsteuersätze: ' + err.message
    umsatzsteuersaetze.value = []
    totalItems.value = 0
    console.error('Fetch Umsatzsteuersätze Error:', err)
  } finally {
    loading.value = false
  }
}

// Delete a Umsatzsteuersatz
async function deleteSatz(id) {
  if (confirm('Sind Sie sicher, dass Sie diesen Umsatzsteuersatz löschen möchten?')) {
    try {
      const response = await fetch(`/api/umsatzsteuersaetze?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Fehler beim Löschen des Umsatzsteuersatzes: HTTP Status ' + response.status)
      umsatzsteuersaetze.value = umsatzsteuersaetze.value.filter(satz => satz.id !== id)
    } catch (err) {
      alert('Fehler beim Löschen des Umsatzsteuersatzes: ' + err.message)
    }
  }
}

// Debounced search to prevent excessive API calls
function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(async () => {
    currentPage.value = 1 // Reset to first page on new search
    await fetchUmsatzsteuersaetze() // Fetch new data from API with search query
    if (searchInput.value) {
      searchInput.value.focus() // Maintain focus on input after search
    }
  }, 500)
}

// Computed properties for pagination (filtering now handled by API)
const filteredUmsatzsteuersaetze = computed(() => {
  return [...umsatzsteuersaetze.value]
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedUmsatzsteuersaetze = computed(() => filteredUmsatzsteuersaetze.value)
// Compute pagination range to show limited page buttons
const maxVisiblePages = 5 // Adjust this number to show more or fewer page buttons
const startPage = computed(() => {
  let start = currentPage.value - Math.floor(maxVisiblePages / 2)
  if (start < 1) start = 1
  if (start > totalPages.value - maxVisiblePages + 1) start = Math.max(1, totalPages.value - maxVisiblePages + 1)
  return start
})
const endPage = computed(() => {
  let end = startPage.value + maxVisiblePages - 1
  if (end > totalPages.value) end = totalPages.value
  return end
})
const pageRange = computed(() => {
  const range = []
  for (let i = startPage.value; i <= endPage.value; i++) {
    range.push(i)
  }
  return range
})

// Watch for page changes to fetch data
watch(currentPage, () => {
  fetchUmsatzsteuersaetze()
})

// Initial fetch on component mount and focus on search input
onMounted(() => {
  fetchUmsatzsteuersaetze();
  if (searchInput.value) {
    searchInput.value.focus();
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
