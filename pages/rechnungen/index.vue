<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ $t('rechnungen.listTitle') }}</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">{{ $t('rechnungen.loadingInvoices') }}</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
        <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="flex gap-2">
          <NuxtLink to="/rechnungen/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('rechnungen.newInvoice') }}</NuxtLink>
          <NuxtLink to="/rechnungen/dashboard" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200">{{ $t('rechnungen.dashboard') }}</NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="searchQuery" type="text" :placeholder="$t('rechnungen.searchPlaceholder')" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="debouncedSearch" ref="searchInput" autofocus>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <select v-model="statusFilter" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-48" @change="fetchRechnungen">
            <option value="">{{ $t('rechnungen.allStatuses') }}</option>
            <option value="Offen">{{ $t('rechnungen.status.open') }}</option>
            <option value="Teilbezahlt">{{ $t('rechnungen.status.partiallyPaid') }}</option>
            <option value="Bezahlt">{{ $t('rechnungen.status.paid') }}</option>
            <option value="Überfällig">{{ $t('rechnungen.status.overdue') }}</option>
            <option value="Storniert">{{ $t('rechnungen.status.cancelled') }}</option>
          </select>
          <Autocomplete
            id="kundeFilter"
            :items="kunden"
            :idKey="'KundenID'"
            :displayFn="getKundeDisplayName"
            :filterFn="filterKunden"
            :placeholder="$t('rechnungen.searchCustomer')"
            @select="handleKundeSelect"
            @search="handleKundeSearch"
            class="w-full md:w-64"
            ref="kundeAutocomplete"
          />
          <div class="flex items-center gap-2">
            <span class="text-gray-600 text-sm whitespace-nowrap">{{ $t('rechnungen.entriesPerPage') }}</span>
            <select v-model="itemsPerPage" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @change="fetchRechnungen">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div v-for="rechnung in paginatedRechnungen" :key="rechnung.RechnungsID" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col gap-2">
              <h3 class="text-lg font-semibold text-gray-800">{{ rechnung.Rechnungsnummer }}</h3>
              <p class="text-gray-600 text-sm">{{ $t('rechnungen.date') }}: {{ formatDate(rechnung.Rechnungsdatum) }}</p>
              <p class="text-gray-600 text-sm">{{ $t('rechnungen.customer') }}: {{ getKundenName(rechnung) }}</p>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-xs">{{ $t('rechnungen.totalAmount') }}:</span>
                  <span class="text-blue-600 text-sm font-medium">{{ Number(rechnung.GesamtbetragBrutto).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-xs">{{ $t('rechnungen.statusLabel') }}:</span>
                  <span :class="getStatusClass(rechnung.Zahlungsstatus)" class="text-sm font-medium">{{ rechnung.Zahlungsstatus }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/rechnungen/details/${rechnung.RechnungsID}`" class="bg-green-100 text-green-800 px-3 py-1 rounded-lg hover:bg-green-200 transition duration-200 text-sm">{{ $t('rechnungen.details') }}</NuxtLink>
              <NuxtLink :to="`/rechnungen/edit/${rechnung.RechnungsID}`" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200 transition duration-200 text-sm">{{ $t('rechnungen.edit') }}</NuxtLink>
              <button @click="deleteRechnung(rechnung.RechnungsID)" class="bg-red-100 text-red-800 px-3 py-1 rounded-lg hover:bg-red-200 transition duration-200 text-sm">{{ $t('rechnungen.delete') }}</button>
            </div>
          </div>
        </div>
        <div v-if="paginatedRechnungen.length === 0" class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
          {{ $t('rechnungen.noInvoicesFound') }}
        </div>
      </div>
      <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="text-gray-600 text-sm">
          {{ $t('rechnungen.showingEntries', { start: startIndex + 1, end: endIndex, total: totalItems }) }}
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <button :disabled="currentPage === 1" @click="currentPage = 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('rechnungen.first') }}</button>
          <button :disabled="currentPage === 1" @click="currentPage -= 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('rechnungen.previous') }}</button>
          <button v-if="startPage > 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200" @click="currentPage = startPage - 1">...</button>
          <button v-for="page in pageRange" :key="page" @click="currentPage = page" :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'" class="px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200">{{ page }}</button>
          <button v-if="endPage < totalPages" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200" @click="currentPage = endPage + 1">...</button>
          <button :disabled="currentPage === totalPages" @click="currentPage += 1" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('rechnungen.next') }}</button>
          <button :disabled="currentPage === totalPages" @click="currentPage = totalPages" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">{{ $t('rechnungen.last') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const rechnungen = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const sortKey = ref('RechnungsID')
const sortOrder = ref('asc')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const statusFilter = ref('')
const kundeFilter = ref('')
const kunden = ref([])
let searchTimeout = null

// Fetch Rechnungen from API
async function fetchRechnungen() {
  try {
    loading.value = true
    const limit = itemsPerPage.value
    const offset = (currentPage.value - 1) * itemsPerPage.value
    let url = `/api/rechnungen?limit=${limit}&offset=${offset}`
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    if (statusFilter.value) {
      url += `&status=${encodeURIComponent(statusFilter.value)}`
    }
    if (kundeFilter.value) {
      url += `&kunde=${encodeURIComponent(kundeFilter.value)}`
    }
    const response = await $fetch(url)
    if (Array.isArray(response)) {
      rechnungen.value = response
      totalItems.value = response.length
    } else {
      rechnungen.value = []
      totalItems.value = 0
      error.value = $t('rechnungen.noInvoicesFoundServerError')
    }
  } catch (err) {
    error.value = $t('rechnungen.errorLoadingInvoices') + err.message
    rechnungen.value = []
    totalItems.value = 0
    console.error('Fetch Rechnungen Error:', err)
  } finally {
    loading.value = false
  }
}

// Delete a Rechnung
async function deleteRechnung(id) {
  if (confirm($t('rechnungen.confirmDeleteInvoice'))) {
    try {
      await $fetch(`/api/rechnungen?id=${id}`, { method: 'DELETE' })
      rechnungen.value = rechnungen.value.filter(r => r.RechnungsID !== id)
    } catch (err) {
      alert($t('rechnungen.errorDeletingInvoice') + err.message)
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
    await fetchRechnungen() // Fetch new data from API with search query
    if (searchInput.value) {
      searchInput.value.focus() // Maintain focus on input after search
    }
  }, 500)
}

// Fetch Kunden for filter dropdown with server-side search
async function fetchKunden(search = '') {
  try {
    let url = '/api/kunden?limit=20';
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await $fetch(url);
    if (Array.isArray(response)) {
      kunden.value = response;
    } else {
      console.error('Failed to fetch kunden');
    }
  } catch (err) {
    console.error('Fetch Kunden Error:', err);
  }
}

// Helper function to get display name for Kunde
function getKundeDisplayName(kunde) {
  if (kunde.Firmenname) return kunde.Firmenname
  return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || 'Unbekannt'
}

// Filter function for Autocomplete component (not used with server-side search)
function filterKunden(kunde, search) {
  // With server-side search, filtering is handled by API
  return true;
}

// Handle selection from Autocomplete component
function handleKundeSelect(kunde) {
  kundeFilter.value = kunde ? kunde.KundenID : '';
  currentPage.value = 1; // Reset to first page on filter change
  fetchRechnungen();
}

// Handle search input in Autocomplete for server-side search
function handleKundeSearch(search) {
  fetchKunden(search);
}

// Sort function for table headers
function sort(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  rechnungen.value.sort((a, b) => {
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
const filteredRechnungen = computed(() => {
  return [...rechnungen.value]
})

// Helper function to format date
function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('de-DE')
}

// Helper function to get Kunden name
function getKundenName(rechnung) {
  if (rechnung.Kunden) {
    if (rechnung.Kunden.Firmenname) return rechnung.Kunden.Firmenname
    return `${rechnung.Kunden.Vorname || ''} ${rechnung.Kunden.Nachname || ''}`.trim() || 'Unbekannt'
  }
  return 'Unbekannt'
}

// Helper function to get status class
function getStatusClass(status) {
  switch (status) {
    case 'Bezahlt':
      return 'text-green-600'
    case 'Offen':
      return 'text-yellow-600'
    case 'Überfällig':
      return 'text-red-600'
    case 'Teilbezahlt':
      return 'text-orange-600'
    case 'Storniert':
      return 'text-gray-500'
    default:
      return 'text-gray-600'
  }
}

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedRechnungen = computed(() => filteredRechnungen.value)
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
  fetchRechnungen()
})

// Initial fetch on component mount and focus on search input
onMounted(async () => {
  await fetchRechnungen();
  await fetchKunden();
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
