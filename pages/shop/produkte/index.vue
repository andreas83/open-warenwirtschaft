<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('shop.products.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('shop.products.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/shop/produkte/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-plus text-xl"></span>
        {{ $t('shop.products.newProduct') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('common.search') }}
          </label>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('shop.products.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debounceSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('shop.products.category') }}
          </label>
          <select
            v-model="filterKategorie"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadProducts"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="category in categories" :key="category.ShopKategorieID" :value="category.ShopKategorieID">
              {{ category.Name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('common.status') }}
          </label>
          <select
            v-model="filterAktiv"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadProducts"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="true">{{ $t('shop.products.active') }}</option>
            <option value="false">{{ $t('shop.products.inactive') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('shop.products.featured') }}
          </label>
          <select
            v-model="filterHervorgehoben"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadProducts"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="true">{{ $t('common.yes') }}</option>
            <option value="false">{{ $t('common.no') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Products Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="product in products"
        :key="product.ShopProduktID"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
      >
        <div v-if="product.HauptbildPfad" class="h-48 bg-gray-200 overflow-hidden">
          <img :src="product.HauptbildPfad" :alt="product.Titel" class="w-full h-full object-cover" />
        </div>
        <div v-else class="h-48 bg-gray-200 flex items-center justify-center">
          <span class="i-mdi-image-outline text-6xl text-gray-400"></span>
        </div>

        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-semibold text-gray-800 line-clamp-2">{{ product.Titel }}</h3>
            <span
              v-if="product.IstHervorgehoben"
              class="i-mdi-star text-yellow-500 text-xl flex-shrink-0"
            ></span>
          </div>

          <p v-if="product.ShopKategorien" class="text-sm text-gray-500 mb-2">
            {{ product.ShopKategorien.Name }}
          </p>

          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-2xl font-bold text-blue-600">{{ formatPrice(product.Preis) }}</span>
            <span v-if="product.UVP && product.UVP > product.Preis" class="text-sm text-gray-400 line-through">
              {{ formatPrice(product.UVP) }}
            </span>
          </div>

          <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div class="flex items-center gap-1">
              <span class="i-mdi-package-variant"></span>
              <span>{{ product.Lagerbestand || 0 }}</span>
            </div>
            <div v-if="product.SKU" class="flex items-center gap-1 text-xs">
              <span>SKU: {{ product.SKU }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 mb-3">
            <span
              :class="product.IstAktiv ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              class="px-2 py-1 text-xs font-semibold rounded-full"
            >
              {{ product.IstAktiv ? $t('shop.products.active') : $t('shop.products.inactive') }}
            </span>
            <span class="text-xs text-gray-500">
              {{ product._count.ShopBewertungen || 0 }} {{ $t('shop.products.reviews') }}
            </span>
          </div>

          <div class="pt-3 border-t border-gray-200 flex justify-between items-center">
            <button
              @click="deleteProduct(product.ShopProduktID)"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              {{ $t('common.delete') }}
            </button>
            <NuxtLink
              :to="`/shop/produkte/edit/${product.ShopProduktID}`"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {{ $t('common.edit') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && products.length === 0" class="text-center py-12">
      <span class="i-mdi-shopping text-6xl text-gray-400 mb-4"></span>
      <p class="text-gray-500 text-lg">{{ $t('shop.products.noProducts') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="mt-6 flex justify-center gap-2">
      <button
        @click="goToPage(0)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.first') }}
      </button>
      <button
        @click="goToPage(offset - limit)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.previous') }}
      </button>
      <span class="px-3 py-1">
        {{ Math.floor(offset / limit) + 1 }} / {{ Math.ceil(total / limit) }}
      </span>
      <button
        @click="goToPage(offset + limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.next') }}
      </button>
      <button
        @click="goToPage(Math.floor(total / limit) * limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.last') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { $t } = useNuxtApp()
const loading = ref(true)
const products = ref([])
const categories = ref([])
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const searchQuery = ref('')
const filterKategorie = ref('')
const filterAktiv = ref('')
const filterHervorgehoben = ref('')
let debounceTimer = null

const loadProducts = async () => {
  loading.value = true
  try {
    const params = {
      limit: limit.value,
      offset: offset.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (filterKategorie.value) params.kategorieId = filterKategorie.value
    if (filterAktiv.value) params.istAktiv = filterAktiv.value
    if (filterHervorgehoben.value) params.istHervorgehoben = filterHervorgehoben.value

    const data = await $fetch('/api/shop/produkte', { params })
    products.value = data.products
    total.value = data.total
  } catch (error) {
    console.error('Error loading products:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const data = await $fetch('/api/shop/kategorien')
    categories.value = data.categories
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const debounceSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    offset.value = 0
    loadProducts()
  }, 300)
}

const goToPage = (newOffset) => {
  offset.value = newOffset
  loadProducts()
}

const deleteProduct = async (id) => {
  if (!confirm($t('shop.products.confirmDelete'))) return

  try {
    await $fetch(`/api/shop/produkte?id=${id}`, { method: 'DELETE' })
    await loadProducts()
  } catch (error) {
    alert(error.data?.message || $t('common.error'))
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>
