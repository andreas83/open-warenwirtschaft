<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ $t('produkte.listTitle') }}</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">{{ $t('produkte.loadingProducts') }}</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="flex gap-2">
          <NuxtLink to="/produkte/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('produkte.newProduct') }}</NuxtLink>
          <NuxtLink to="/produkte/kategorien" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200">{{ $t('produkte.categories') }}</NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="searchQuery" type="text" :placeholder="$t('produkte.searchPlaceholder')" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="debouncedSearch" ref="searchInput" autofocus>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm whitespace-nowrap">{{ $t('produkte.entriesPerPage') }}</span>
            <select v-model="itemsPerPage" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @change="fetchProdukte">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="produkt in paginatedProdukte" :key="produkt.ProduktID" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col md:flex-row gap-4">
              <div v-if="getMainImage(produkt)" class="w-full md:w-24 h-24 flex-shrink-0">
                <img :src="getMainImage(produkt)" alt="Produktbild" class="w-full h-full object-cover rounded-md border border-gray-200">
              </div>
              <div class="flex flex-col gap-2">
                <h3 class="text-lg font-semibold text-gray-800">{{ produkt.Name }}</h3>
                <p class="text-gray-600 text-sm">{{ produkt.Beschreibung || $t('produkte.noDescription') }}</p>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500 text-xs">{{ $t('produkte.price') }}</span>
                    <span class="text-blue-600 text-sm font-medium">{{ getStandardPrice(produkt) }} €</span>
                  </div>
                  <div v-if="getActionPrice(produkt)" class="flex items-center gap-2">
                    <span class="text-gray-500 text-xs">{{ $t('produkte.actionPrice') }}</span>
                    <span class="text-red-600 text-sm font-medium">{{ getActionPrice(produkt) }} €</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/produkte/edit/${produkt.ProduktID}`" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200 transition duration-200 text-sm">{{ $t('produkte.edit') }}</NuxtLink>
              <button @click="deleteProdukt(produkt.ProduktID)" class="bg-red-100 text-red-800 px-3 py-1 rounded-lg hover:bg-red-200 transition duration-200 text-sm">{{ $t('produkte.delete') }}</button>
            </div>
          </div>
        </div>
        <div v-if="paginatedProdukte.length === 0" class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
          {{ $t('produkte.noProductsFound') }}
        </div>
      </div>
      <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="text-gray-600 text-sm">
          {{ $t('produkte.showingEntries', { start: startIndex + 1, end: endIndex, total: totalItems }) }}
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <button :disabled="currentPage === 1" @click="currentPage = 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('produkte.first') }}</button>
          <button :disabled="currentPage === 1" @click="currentPage -= 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('produkte.previous') }}</button>
          <button v-if="startPage > 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200" @click="currentPage = startPage - 1">...</button>
          <button v-for="page in pageRange" :key="page" @click="currentPage = page" :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'" class="px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200">{{ page }}</button>
          <button v-if="endPage < totalPages" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200" @click="currentPage = endPage + 1">...</button>
          <button :disabled="currentPage === totalPages" @click="currentPage += 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('produkte.next') }}</button>
          <button :disabled="currentPage === totalPages" @click="currentPage = totalPages" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('produkte.last') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const produkte = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const sortKey = ref('ProduktID')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
let searchTimeout = null

// Fetch Produkte from API
async function fetchProdukte() {
  try {
    loading.value = true
    const limit = itemsPerPage.value
    const offset = (currentPage.value - 1) * itemsPerPage.value
    let url = `/api/produkte?limit=${limit}&offset=${offset}`
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    if (response && response.data && Array.isArray(response.data)) {
      produkte.value = response.data
      totalItems.value = response.total || 0
    } else {
      produkte.value = []
      totalItems.value = 0
      error.value = 'Keine Produkte gefunden oder ungültige Antwort vom Server.'
    }
  } catch (err) {
    error.value = $t('produkte.errorLoadingProducts') + err.message
    produkte.value = []
    totalItems.value = 0
    console.error('Fetch Produkte Error:', err)
  } finally {
    loading.value = false
  }
}

// Delete a Produkt
async function deleteProdukt(id) {
  if (confirm($t('produkte.confirmDeleteProduct'))) {
    try {
      await $fetch(`/api/produkte?id=${id}`, { method: 'DELETE' })
      produkte.value = produkte.value.filter(p => p.ProduktID !== id)
    } catch (err) {
      alert($t('produkte.errorDeletingProduct') + err.message)
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
    await fetchProdukte() // Fetch new data from API with search query
    if (searchInput.value) {
      searchInput.value.focus() // Maintain focus on input after search
    }
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
  produkte.value.sort((a, b) => {
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
const filteredProdukte = computed(() => {
  return [...produkte.value]
})

// Helper functions to get standard and action prices
function getStandardPrice(produkt) {
  if (produkt.Preise && produkt.Preise.length > 0) {
    const standardPrice = produkt.Preise.find(p => p.PreisTyp === 'Standard');
    return standardPrice ? parseFloat(standardPrice.Preis).toFixed(2) : '0.00';
  }
  return '0.00';
}

function getActionPrice(produkt) {
  if (produkt.Preise && produkt.Preise.length > 0) {
    const actionPrice = produkt.Preise.find(p => p.PreisTyp === 'Aktion');
    return actionPrice ? parseFloat(actionPrice.Preis).toFixed(2) : '';
  }
  return '';
}

// Helper function to get the main image for a product
function getMainImage(produkt) {
  if (produkt.ProduktBilder && produkt.ProduktBilder.length > 0) {
    const mainImage = produkt.ProduktBilder.find(img => img.IstHauptbild);
    return mainImage ? mainImage.BildPfad : produkt.ProduktBilder[0].BildPfad;
  }
  return '';
}

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedProdukte = computed(() => filteredProdukte.value)
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
  fetchProdukte()
})

// Initial fetch on component mount and focus on search input
onMounted(() => {
  fetchProdukte();
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
