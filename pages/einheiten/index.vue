<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Einheiten Liste</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">Lade Einheiten...</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div>
          <NuxtLink to="/einheiten/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">Neue Einheit</NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="searchQuery" type="text" placeholder="Suche nach Name, Symbol..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="debouncedSearch" ref="searchInput" autofocus>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm whitespace-nowrap">Einträge pro Seite:</span>
            <select v-model="itemsPerPage" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @change="fetchEinheiten">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="einheit in paginatedEinheiten" :key="einheit.EinheitID" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-gray-800">{{ einheit.Name }}</h3>
              <p class="text-gray-600 text-sm">Symbol: {{ einheit.Symbol }}</p>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/einheiten/edit/${einheit.EinheitID}`" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200 transition duration-200 text-sm">Bearbeiten</NuxtLink>
              <button @click="deleteEinheit(einheit.EinheitID)" class="bg-red-100 text-red-800 px-3 py-1 rounded-lg hover:bg-red-200 transition duration-200 text-sm">Löschen</button>
            </div>
          </div>
        </div>
        <div v-if="paginatedEinheiten.length === 0" class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
          Keine Einheiten gefunden, die den Suchkriterien entsprechen.
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

const einheiten = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
let searchTimeout = null

// Fetch Einheiten from API
async function fetchEinheiten() {
  try {
    loading.value = true
    const limit = itemsPerPage.value
    const offset = (currentPage.value - 1) * itemsPerPage.value
    let url = `/api/einheiten?limit=${limit}&offset=${offset}`
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    if (response && response.data && Array.isArray(response.data)) {
      einheiten.value = response.data
      totalItems.value = response.total // Use total from API response for pagination
    } else {
      einheiten.value = []
      totalItems.value = 0
      error.value = 'Keine Einheiten gefunden oder ungültige Antwort vom Server.'
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Einheiten: ' + err.message
    einheiten.value = []
    totalItems.value = 0
    console.error('Fetch Einheiten Error:', err)
  } finally {
    loading.value = false
  }
}

// Delete an Einheit
async function deleteEinheit(id) {
  if (confirm('Sind Sie sicher, dass Sie diese Einheit löschen möchten?')) {
    try {
      await $fetch(`/api/einheiten?id=${id}`, { method: 'DELETE' })
      einheiten.value = einheiten.value.filter(e => e.EinheitID !== id)
    } catch (err) {
      alert('Fehler beim Löschen der Einheit: ' + err.message)
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
    await fetchEinheiten() // Fetch new data from API with search query
    if (searchInput.value) {
      searchInput.value.focus() // Maintain focus on input after search
    }
  }, 500)
}

const filteredEinheiten = computed(() => {
  return [...einheiten.value]
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedEinheiten = computed(() => filteredEinheiten.value)
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
  fetchEinheiten()
})

// Initial fetch on component mount and focus on search input
onMounted(() => {
  fetchEinheiten();
  if (searchInput.value) {
    searchInput.value.focus();
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
