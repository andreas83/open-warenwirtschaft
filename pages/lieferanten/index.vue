<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Lieferanten Liste</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">Lade Lieferanten...</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div>
          <NuxtLink to="/lieferanten/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">Neuer Lieferant</NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="searchQuery" type="text" placeholder="Suche nach Name, Adresse..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="debouncedSearch" ref="searchInput" autofocus>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm whitespace-nowrap">Einträge pro Seite:</span>
            <select v-model="itemsPerPage" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @change="fetchLieferanten">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="lieferant in paginatedLieferanten" :key="lieferant.LieferantenID" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-gray-800">{{ lieferant.Name }}</h3>
              <p class="text-gray-600 text-sm">{{ lieferant.Adresse || 'Keine Adresse' }}</p>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-xs">Telefon:</span>
                  <span class="text-blue-600 text-sm font-medium">{{ lieferant.Telefon || 'N/A' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-xs">Email:</span>
                  <span class="text-blue-600 text-sm font-medium">{{ lieferant.Email || 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/lieferanten/edit/${lieferant.LieferantenID}`" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200 transition duration-200 text-sm">Bearbeiten</NuxtLink>
              <button @click="deleteLieferant(lieferant.LieferantenID)" class="bg-red-100 text-red-800 px-3 py-1 rounded-lg hover:bg-red-200 transition duration-200 text-sm">Löschen</button>
            </div>
          </div>
        </div>
        <div v-if="paginatedLieferanten.length === 0" class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
          Keine Lieferanten gefunden, die den Suchkriterien entsprechen.
        </div>
      </div>
      <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="text-gray-600 text-sm">
          Zeige {{ startIndex + 1 }} bis {{ endIndex }} von {{ totalItems }} Einträgen
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <button :disabled="currentPage === 1" @click="currentPage -= 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">Vorherige</button>
          <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'" class="px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200">{{ page }}</button>
          <button :disabled="currentPage === totalPages" @click="currentPage += 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">Nächste</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const lieferanten = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const sortKey = ref('LieferantenID')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
let searchTimeout = null

// Fetch Lieferanten from API
async function fetchLieferanten() {
  try {
    loading.value = true
    const limit = itemsPerPage.value
    const offset = (currentPage.value - 1) * itemsPerPage.value
    let url = `/api/lieferanten?limit=${limit}&offset=${offset}`
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    if (response && response.data && Array.isArray(response.data)) {
      lieferanten.value = response.data
      totalItems.value = response.total || 0
    } else {
      lieferanten.value = []
      totalItems.value = 0
      error.value = 'Keine Lieferanten gefunden oder ungültige Antwort vom Server.'
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Lieferanten: ' + err.message
    lieferanten.value = []
    totalItems.value = 0
    console.error('Fetch Lieferanten Error:', err)
  } finally {
    loading.value = false
  }
}

// Delete a Lieferant
async function deleteLieferant(id) {
  if (confirm('Sind Sie sicher, dass Sie diesen Lieferanten löschen möchten?')) {
    try {
      await $fetch(`/api/lieferanten?id=${id}`, { method: 'DELETE' })
      lieferanten.value = lieferanten.value.filter(l => l.LieferantenID !== id)
    } catch (err) {
      alert('Fehler beim Löschen des Lieferanten: ' + err.message)
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
    fetchLieferanten() // Fetch new data from API with search query
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
  lieferanten.value.sort((a, b) => {
    const valueA = a[key]
    const valueB = b[key]
    if (typeof valueA === 'string') {
      return sortOrder.value === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    } else {
      return sortOrder.value === 'asc' ? valueA - valueB : valueB - valueA
    }
  })
}

// Computed properties for pagination (filtering now handled by API)
const filteredLieferanten = computed(() => {
  return [...lieferanten.value]
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedLieferanten = computed(() => filteredLieferanten.value)

// Watch for page changes to fetch data
watch(currentPage, () => {
  fetchLieferanten()
})

// Initial fetch on component mount and focus on search input
onMounted(() => {
  fetchLieferanten();
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
