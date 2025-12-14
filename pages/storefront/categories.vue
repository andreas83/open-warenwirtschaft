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
            <NuxtLink to="/storefront/products" class="text-gray-700 hover:text-primary-600">
              {{ $t('storefront.products') }}
            </NuxtLink>
            <NuxtLink to="/storefront/categories" class="text-primary-600 font-medium">
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

    <!-- Page Header -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl md:text-4xl font-bold">{{ $t('storefront.allCategories') }}</h1>
        <p class="mt-2 text-lg opacity-90">{{ $t('storefront.browseCategories') }}</p>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="loading" class="text-center py-12">
        <div class="i-mdi-loading animate-spin text-4xl text-primary-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-600">
        {{ error }}
      </div>

      <div v-else-if="categories.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
        <div class="i-mdi-folder-open text-6xl text-gray-300 mx-auto mb-4"></div>
        <p class="text-gray-600">{{ $t('storefront.noCategories') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.ShopKategorieID"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
          @click="$router.push(`/storefront/products?category=${category.ShopKategorieID}`)"
        >
          <div class="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <div class="i-mdi-tag text-6xl text-primary-600 group-hover:scale-110 transition-transform"></div>
          </div>

          <div class="p-5">
            <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ category.Name }}</h3>
            <p v-if="category.Beschreibung" class="text-sm text-gray-600 mb-3 line-clamp-2">
              {{ category.Beschreibung }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">
                {{ category._count?.ShopProdukte || 0 }} {{ $t('storefront.products') }}
              </span>
              <div class="i-mdi-chevron-right text-primary-600 group-hover:translate-x-1 transition-transform"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subcategories Section -->
      <div v-if="subcategories.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('storefront.subcategories') }}</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
            v-for="sub in subcategories"
            :key="sub.ShopKategorieID"
            class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer text-center group"
            @click="$router.push(`/storefront/products?category=${sub.ShopKategorieID}`)"
          >
            <div class="i-mdi-folder text-3xl text-primary-500 mb-2 group-hover:text-primary-600"></div>
            <h4 class="font-medium text-gray-900 text-sm">{{ sub.Name }}</h4>
            <span class="text-xs text-gray-500">{{ sub._count?.ShopProdukte || 0 }} {{ $t('storefront.items') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-auto">
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

const loading = ref(true)
const error = ref('')
const categories = ref<any[]>([])
const subcategories = ref<any[]>([])
const cartItemCount = ref(0)

onMounted(async () => {
  await loadCategories()
  loadCartCount()
})

async function loadCategories() {
  try {
    loading.value = true
    error.value = ''

    // Load parent categories (top-level)
    const parentRes = await $fetch('/api/shop/kategorien', {
      query: {
        istSichtbar: 'true',
        parentId: 'null'
      }
    }) as any

    categories.value = parentRes.categories || []

    // Load subcategories
    const subRes = await $fetch('/api/shop/kategorien', {
      query: {
        istSichtbar: 'true',
        hasParent: 'true'
      }
    }) as any

    subcategories.value = subRes.categories || []
  } catch (err: any) {
    console.error('Error loading categories:', err)
    error.value = err.message || 'Fehler beim Laden der Kategorien'
  } finally {
    loading.value = false
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
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
