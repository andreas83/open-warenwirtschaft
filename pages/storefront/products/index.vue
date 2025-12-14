<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/storefront" class="text-2xl font-bold text-primary-600">
              {{ $t('storefront.storeName') }}
            </NuxtLink>
          </div>

          <nav class="hidden md:flex space-x-8">
            <NuxtLink to="/storefront" class="text-gray-700 hover:text-primary-600">
              {{ $t('storefront.home') }}
            </NuxtLink>
            <NuxtLink to="/storefront/products" class="text-gray-700 hover:text-primary-600 font-semibold">
              {{ $t('storefront.products') }}
            </NuxtLink>
            <NuxtLink to="/storefront/categories" class="text-gray-700 hover:text-primary-600">
              {{ $t('storefront.categories') }}
            </NuxtLink>
          </nav>

          <div class="flex items-center space-x-4">
            <button @click="$router.push('/storefront/cart')" class="relative p-2 text-gray-700 hover:text-primary-600">
              <div class="i-mdi-cart text-2xl"></div>
              <span v-if="cartItemCount > 0" class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{ cartItemCount }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('storefront.filters') }}</h3>

            <!-- Search -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('storefront.search') }}
              </label>
              <input
                v-model="filters.search"
                type="text"
                :placeholder="$t('storefront.searchPlaceholder')"
                class="input w-full"
                @input="debouncedSearch"
              />
            </div>

            <!-- Category Filter -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('storefront.category') }}
              </label>
              <select v-model="filters.categoryId" @change="loadProducts" class="input w-full">
                <option :value="null">{{ $t('storefront.allCategories') }}</option>
                <option
                  v-for="category in categories"
                  :key="category.ShopKategorieID"
                  :value="category.ShopKategorieID"
                >
                  {{ category.Name }}
                </option>
              </select>
            </div>

            <!-- Price Range -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('storefront.priceRange') }}
              </label>
              <div class="flex gap-2">
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  :placeholder="$t('storefront.min')"
                  class="input w-full"
                  min="0"
                  @change="loadProducts"
                />
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  :placeholder="$t('storefront.max')"
                  class="input w-full"
                  min="0"
                  @change="loadProducts"
                />
              </div>
            </div>

            <!-- Reset Filters -->
            <button @click="resetFilters" class="btn-secondary w-full">
              {{ $t('storefront.resetFilters') }}
            </button>
          </div>
        </aside>

        <!-- Product Grid -->
        <main class="flex-1">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ selectedCategoryName || $t('storefront.allProducts') }}
            </h1>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">
                {{ total }} {{ $t('storefront.productsFound') }}
              </span>
              <select v-model="sortBy" @change="loadProducts" class="input">
                <option value="default">{{ $t('storefront.sortBy.default') }}</option>
                <option value="price-asc">{{ $t('storefront.sortBy.priceAsc') }}</option>
                <option value="price-desc">{{ $t('storefront.sortBy.priceDesc') }}</option>
                <option value="name">{{ $t('storefront.sortBy.name') }}</option>
              </select>
            </div>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="i-mdi-loading animate-spin text-4xl text-primary-600"></div>
          </div>

          <div v-else-if="error" class="text-center py-12 text-red-600">
            {{ error }}
          </div>

          <div v-else-if="products.length === 0" class="text-center py-12 text-gray-600">
            {{ $t('storefront.noProductsFound') }}
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="product in products"
              :key="product.ShopProduktID"
              class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              @click="$router.push(`/storefront/products/${product.ShopProduktID}`)"
            >
              <div class="aspect-square bg-gray-200 flex items-center justify-center relative">
                <img
                  v-if="product.Hauptbild"
                  :src="product.Hauptbild"
                  :alt="product.Titel"
                  class="w-full h-full object-cover"
                />
                <div v-else class="i-mdi-image text-6xl text-gray-400"></div>

                <div v-if="product.Angebotspreis" class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  {{ $t('storefront.sale') }}
                </div>
              </div>

              <div class="p-4">
                <div v-if="product.ShopKategorien" class="text-xs text-gray-500 mb-1">
                  {{ product.ShopKategorien.Name }}
                </div>

                <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {{ product.Titel }}
                </h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">
                  {{ product.Kurzbeschreibung }}
                </p>

                <div class="flex items-center justify-between mb-3">
                  <div>
                    <span v-if="product.Angebotspreis" class="text-sm text-gray-500 line-through mr-2">
                      {{ formatPrice(product.Preis) }}
                    </span>
                    <span class="text-lg font-bold text-primary-600">
                      {{ formatPrice(product.Angebotspreis || product.Preis) }}
                    </span>
                  </div>

                  <div v-if="product._count?.ShopBewertungen > 0" class="flex items-center text-sm text-gray-600">
                    <div class="i-mdi-star text-yellow-500 mr-1"></div>
                    <span>{{ product._count.ShopBewertungen }}</span>
                  </div>
                </div>

                <button
                  @click.stop="addToCart(product)"
                  class="btn-primary w-full"
                >
                  {{ $t('storefront.addToCart') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="total > limit" class="flex justify-center gap-2 mt-8">
            <button
              @click="previousPage"
              :disabled="offset === 0"
              class="btn-secondary"
              :class="{ 'opacity-50 cursor-not-allowed': offset === 0 }"
            >
              {{ $t('storefront.previous') }}
            </button>

            <span class="px-4 py-2 text-gray-700">
              {{ $t('storefront.page') }} {{ currentPage }} {{ $t('storefront.of') }} {{ totalPages }}
            </span>

            <button
              @click="nextPage"
              :disabled="offset + limit >= total"
              class="btn-secondary"
              :class="{ 'opacity-50 cursor-not-allowed': offset + limit >= total }"
            >
              {{ $t('storefront.next') }}
            </button>
          </div>
        </main>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 {{ $t('storefront.storeName') }}. {{ $t('storefront.allRightsReserved') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const toast = useToast()

const loading = ref(true)
const error = ref('')
const products = ref<any[]>([])
const categories = ref<any[]>([])
const total = ref(0)
const limit = ref(12)
const offset = ref(0)
const sortBy = ref('default')
const cartItemCount = ref(0)

const filters = ref({
  search: '',
  categoryId: route.query.category ? parseInt(route.query.category as string) : null,
  minPrice: null as number | null,
  maxPrice: null as number | null
})

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.ceil(total.value / limit.value))
const selectedCategoryName = computed(() => {
  if (!filters.value.categoryId) return ''
  const category = categories.value.find(c => c.ShopKategorieID === filters.value.categoryId)
  return category?.Name || ''
})

let searchTimeout: NodeJS.Timeout | null = null

onMounted(async () => {
  await loadCategories()
  await loadProducts()
  loadCartCount()
})

async function loadCategories() {
  try {
    const res = await $fetch('/api/shop/kategorien', {
      query: { istSichtbar: 'true', limit: 100 }
    }) as any
    categories.value = res.categories || []
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

async function loadProducts() {
  try {
    loading.value = true
    error.value = ''

    const query: any = {
      istAktiv: 'true',
      limit: limit.value,
      offset: offset.value
    }

    if (filters.value.search) {
      query.search = filters.value.search
    }

    if (filters.value.categoryId) {
      query.kategorieId = filters.value.categoryId
    }

    const res = await $fetch('/api/shop/produkte', { query }) as any
    let productList = res.products || []

    // Client-side price filtering
    if (filters.value.minPrice !== null) {
      productList = productList.filter((p: any) => {
        const price = p.Angebotspreis || p.Preis
        return price >= filters.value.minPrice!
      })
    }

    if (filters.value.maxPrice !== null) {
      productList = productList.filter((p: any) => {
        const price = p.Angebotspreis || p.Preis
        return price <= filters.value.maxPrice!
      })
    }

    // Client-side sorting
    if (sortBy.value === 'price-asc') {
      productList.sort((a: any, b: any) => {
        const priceA = a.Angebotspreis || a.Preis || 0
        const priceB = b.Angebotspreis || b.Preis || 0
        return priceA - priceB
      })
    } else if (sortBy.value === 'price-desc') {
      productList.sort((a: any, b: any) => {
        const priceA = a.Angebotspreis || a.Preis || 0
        const priceB = b.Angebotspreis || b.Preis || 0
        return priceB - priceA
      })
    } else if (sortBy.value === 'name') {
      productList.sort((a: any, b: any) => a.Titel.localeCompare(b.Titel))
    }

    products.value = productList
    total.value = res.total || 0
  } catch (err: any) {
    console.error('Error loading products:', err)
    error.value = err.message || 'Fehler beim Laden der Produkte'
  } finally {
    loading.value = false
  }
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    offset.value = 0
    loadProducts()
  }, 500)
}

function resetFilters() {
  filters.value = {
    search: '',
    categoryId: null,
    minPrice: null,
    maxPrice: null
  }
  sortBy.value = 'default'
  offset.value = 0
  loadProducts()
}

function previousPage() {
  if (offset.value > 0) {
    offset.value = Math.max(0, offset.value - limit.value)
    loadProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function nextPage() {
  if (offset.value + limit.value < total.value) {
    offset.value += limit.value
    loadProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function loadCartCount() {
  const cart = localStorage.getItem('shopCart')
  if (cart) {
    try {
      const cartData = JSON.parse(cart)
      cartItemCount.value = cartData.items?.length || 0
    } catch (e) {
      console.error('Error parsing cart:', e)
    }
  }
}

function formatPrice(price: number | null | undefined): string {
  if (!price) return '€0.00'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

async function addToCart(product: any) {
  try {
    const cart = localStorage.getItem('shopCart')
    let cartData = cart ? JSON.parse(cart) : { items: [] }

    const existingItem = cartData.items.find((item: any) => item.ShopProduktID === product.ShopProduktID)

    if (existingItem) {
      existingItem.Menge++
    } else {
      cartData.items.push({
        ShopProduktID: product.ShopProduktID,
        Titel: product.Titel,
        Preis: product.Angebotspreis || product.Preis,
        Hauptbild: product.Hauptbild,
        Menge: 1
      })
    }

    localStorage.setItem('shopCart', JSON.stringify(cartData))
    cartItemCount.value = cartData.items.length

    toast.success('Produkt zum Warenkorb hinzugefügt')
  } catch (err) {
    console.error('Error adding to cart:', err)
    toast.error('Fehler beim Hinzufügen zum Warenkorb')
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
