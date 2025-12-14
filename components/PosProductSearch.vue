<template>
  <div class="h-full flex flex-col">
    <!-- Search Header -->
    <div class="p-4 border-b" :class="{'border-gray-200': !darkMode, 'border-gray-700': darkMode}">
      <div class="flex gap-3">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <span class="i-mdi-magnify w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                :class="{'text-gray-400': !darkMode, 'text-gray-500': darkMode}"></span>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('pos.searchProducts')"
            class="w-full pl-10 pr-4 py-3 rounded-lg border text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            :class="{
              'bg-white border-gray-300': !darkMode,
              'bg-gray-700 border-gray-600 text-white placeholder-gray-400': darkMode
            }"
            @input="debouncedSearch"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
            :class="{'hover:bg-gray-600': darkMode}">
            <span class="i-mdi-close w-5 h-5" :class="{'text-gray-500': !darkMode, 'text-gray-400': darkMode}"></span>
          </button>
        </div>

        <!-- Barcode Scanner Button -->
        <button
          class="px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors"
          :class="{
            'border-gray-300 hover:bg-gray-100': !darkMode,
            'border-gray-600 hover:bg-gray-700': darkMode
          }">
          <span class="i-mdi-barcode-scan w-6 h-6"></span>
        </button>
      </div>

      <!-- Category Tabs -->
      <div class="flex gap-2 mt-3 overflow-x-auto pb-2">
        <button
          @click="selectedCategory = null"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="selectedCategory === null
            ? 'bg-indigo-500 text-white'
            : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          ">
          {{ $t('pos.allProducts') }}
        </button>
        <button
          v-for="category in categories"
          :key="category.KategorieID"
          @click="selectedCategory = category.KategorieID"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
          :class="selectedCategory === category.KategorieID
            ? 'bg-indigo-500 text-white'
            : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
          ">
          {{ category.Kategoriename }}
        </button>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="flex-1 overflow-auto p-4">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="i-svg-spinners-blocks-wave w-10 h-10 text-indigo-500"></div>
      </div>

      <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
        <span class="i-mdi-package-variant w-16 h-16 mb-4 opacity-50"></span>
        <p>{{ $t('pos.noProductsFound') }}</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <button
          v-for="product in products"
          :key="product.ProduktID"
          @click="$emit('addToCart', product)"
          class="flex flex-col rounded-xl border overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          :class="{
            'bg-white border-gray-200 hover:border-indigo-300': !darkMode,
            'bg-gray-700 border-gray-600 hover:border-indigo-500': darkMode
          }">
          <!-- Product Image -->
          <div class="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden"
               :class="{'bg-gray-600': darkMode}">
            <img
              v-if="product.ProduktBilder?.[0]?.BildPfad"
              :src="product.ProduktBilder[0].BildPfad"
              :alt="product.Produktname"
              class="w-full h-full object-cover"
            />
            <span v-else class="i-mdi-package-variant w-12 h-12 opacity-30"></span>
          </div>

          <!-- Product Info -->
          <div class="p-3 flex flex-col gap-1">
            <p class="font-medium text-sm line-clamp-2 leading-tight"
               :class="{'text-gray-800': !darkMode, 'text-white': darkMode}">
              {{ product.Produktname }}
            </p>
            <p class="text-lg font-bold text-indigo-600">
              {{ formatPrice(product) }}
            </p>
            <p v-if="getStock(product) !== null" class="text-xs"
               :class="getStock(product) > 0 ? 'text-green-600' : 'text-red-500'">
              {{ getStock(product) > 0 ? `${getStock(product)} ${$t('pos.inStock')}` : $t('pos.outOfStock') }}
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['addToCart'])

const searchQuery = ref('')
const selectedCategory = ref(null)
const products = ref([])
const categories = ref([])
const loading = ref(false)
let searchTimeout = null

function formatPrice(product) {
  const price = getProductPrice(product)
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

function getProductPrice(product) {
  if (!product.Preise || product.Preise.length === 0) {
    return 0
  }
  // Find standard price first, then fall back to first available
  const standardPrice = product.Preise.find(p => p.PreisTyp === 'Standard')
  const priceRecord = standardPrice || product.Preise[0]
  return parseFloat(priceRecord.Preis) || 0
}

function getStock(product) {
  // If product has Bestand relation, return stock
  if (product.Bestand?.length > 0) {
    return product.Bestand.reduce((sum, b) => sum + b.Menge, 0)
  }
  return null
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchProducts()
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  fetchProducts()
}

async function fetchProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('limit', '50')

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }
    if (selectedCategory.value) {
      params.append('kategorie', selectedCategory.value)
    }

    const response = await $fetch(`/api/produkte?${params.toString()}`)

    if (response.data) {
      products.value = response.data
    } else if (Array.isArray(response)) {
      products.value = response
    } else {
      products.value = []
    }
  } catch (err) {
    console.error('Error fetching products:', err)
    products.value = []
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const response = await $fetch('/api/kategorien')
    if (Array.isArray(response)) {
      categories.value = response
    } else if (response.data) {
      categories.value = response.data
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

watch(selectedCategory, () => {
  fetchProducts()
})

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
