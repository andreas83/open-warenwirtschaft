<template>
  <div class="container mx-auto py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />
    <h2 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">{{ $t('produkte.listTitle') }}</h2>

    <LoadingSpinner v-if="loading" :text="$t('produkte.loadingProducts')" center />

    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>

    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div class="flex gap-2">
          <NuxtLink to="/produkte/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('produkte.newProduct') }}</NuxtLink>
          <NuxtLink to="/produkte/kategorien" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200">{{ $t('produkte.categories') }}</NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('produkte.searchPlaceholder')"
              class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
              ref="searchInput"
              autofocus
            >
            <div class="i-mdi-magnify absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-600 dark:text-gray-300 text-sm whitespace-nowrap">{{ $t('produkte.entriesPerPage') }}</span>
            <select
              v-model="itemsPerPage"
              class="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchProdukte"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="produkt in paginatedProdukte" :key="produkt.ProduktID" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="flex flex-col md:flex-row gap-4">
              <div v-if="getMainImage(produkt)" class="w-full md:w-24 h-24 flex-shrink-0">
                <img :src="getMainImage(produkt)" alt="Produktbild" class="w-full h-full object-cover rounded-md border border-gray-200 dark:border-gray-700">
              </div>
              <div class="flex flex-col gap-2">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ produkt.Name }}</h3>
                <p class="text-gray-600 dark:text-gray-300 text-sm">{{ produkt.Beschreibung || $t('produkte.noDescription') }}</p>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400 text-xs">{{ $t('produkte.price') }}</span>
                    <span class="text-blue-600 dark:text-blue-400 text-sm font-medium">{{ getStandardPrice(produkt) }} €</span>
                  </div>
                  <div v-if="getActionPrice(produkt)" class="flex items-center gap-2">
                    <span class="text-gray-500 dark:text-gray-400 text-xs">{{ $t('produkte.actionPrice') }}</span>
                    <span class="text-red-600 dark:text-red-400 text-sm font-medium">{{ getActionPrice(produkt) }} €</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/produkte/edit/${produkt.ProduktID}`" class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200 text-sm">{{ $t('produkte.edit') }}</NuxtLink>
              <LoadingButton
                variant="danger"
                size="sm"
                :loading="deletingId === produkt.ProduktID"
                @click="confirmDelete(produkt.ProduktID)"
              >
                {{ $t('produkte.delete') }}
              </LoadingButton>
            </div>
          </div>
        </div>
        <div v-if="paginatedProdukte.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {{ $t('produkte.noProductsFound') }}
        </div>
      </div>

      <div class="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div class="text-gray-600 dark:text-gray-300 text-sm text-center mb-4">
          {{ $t('produkte.showingEntries', { start: startIndex + 1, end: endIndex, total: totalItems }) }}
        </div>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:page="currentPage = $event"
        />
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      v-if="showDeleteModal"
      :title="$t('common.confirmDelete')"
      :message="$t('produkte.confirmDeleteProduct')"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
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
const deletingId = ref(null)
const showDeleteModal = ref(false)
const productToDelete = ref(null)
let searchTimeout = null

const toast = useToast()
const { t } = useI18n()

const breadcrumbs = computed(() => [
  { label: t('menu.products'), to: '/produkte' }
])

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
      error.value = t('produkte.noProductsFound')
    }
  } catch (err) {
    toast.error(t('produkte.errorLoadingProducts') + err.message)
    produkte.value = []
    totalItems.value = 0
    console.error('Fetch Produkte Error:', err)
  } finally {
    loading.value = false
  }
}

// Show delete confirmation
function confirmDelete(id) {
  productToDelete.value = id
  showDeleteModal.value = true
}

// Delete a Produkt
async function handleDelete() {
  const id = productToDelete.value
  showDeleteModal.value = false

  try {
    deletingId.value = id
    await $fetch(`/api/produkte?id=${id}`, { method: 'DELETE' })
    produkte.value = produkte.value.filter(p => p.ProduktID !== id)
    totalItems.value -= 1
    toast.success(t('common.deleteSuccess'))
  } catch (err) {
    toast.error(t('produkte.errorDeletingProduct') + err.message)
  } finally {
    deletingId.value = null
    productToDelete.value = null
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
