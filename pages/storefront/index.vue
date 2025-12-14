<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/storefront" class="text-2xl font-bold text-primary-600">
              {{ $t('shop.storeName') }}
            </NuxtLink>
          </div>

          <nav class="hidden md:flex space-x-8">
            <NuxtLink to="/storefront" class="text-gray-700 hover:text-primary-600">
              {{ $t('shop.home') }}
            </NuxtLink>
            <NuxtLink to="/storefront/products" class="text-gray-700 hover:text-primary-600">
              {{ $t('shop.products') }}
            </NuxtLink>
            <NuxtLink to="/storefront/categories" class="text-gray-700 hover:text-primary-600">
              {{ $t('shop.categories') }}
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

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          {{ $t('shop.heroTitle') }}
        </h1>
        <p class="text-xl mb-8 opacity-90">
          {{ $t('shop.heroSubtitle') }}
        </p>
        <NuxtLink to="/storefront/products" class="btn-primary btn-lg">
          {{ $t('shop.shopNow') }}
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-8">{{ $t('shop.featuredProducts') }}</h2>

      <div v-if="loading" class="text-center py-12">
        <div class="i-mdi-loading animate-spin text-4xl text-primary-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-600">
        {{ error }}
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="product in featuredProducts"
          :key="product.ShopProduktID"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
          @click="$router.push(`/storefront/products/${product.ShopProduktID}`)"
        >
          <div class="aspect-square bg-gray-200 flex items-center justify-center">
            <img
              v-if="product.Hauptbild"
              :src="product.Hauptbild"
              :alt="product.Titel"
              class="w-full h-full object-cover"
            />
            <div v-else class="i-mdi-image text-6xl text-gray-400"></div>
          </div>

          <div class="p-4">
            <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {{ product.Titel }}
            </h3>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">
              {{ product.Kurzbeschreibung }}
            </p>

            <div class="flex items-center justify-between">
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
              class="btn-primary w-full mt-4"
            >
              {{ $t('shop.addToCart') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="bg-gray-100 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">{{ $t('shop.shopByCategory') }}</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            v-for="category in topCategories"
            :key="category.ShopKategorieID"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer text-center"
            @click="$router.push(`/storefront/products?category=${category.ShopKategorieID}`)"
          >
            <div class="i-mdi-tag text-4xl text-primary-600 mb-3"></div>
            <h3 class="font-semibold text-gray-900">{{ category.Name }}</h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ category._count?.ShopProdukte }} {{ $t('shop.products') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; 2025 {{ $t('shop.storeName') }}. {{ $t('shop.allRightsReserved') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { $api } = useNuxtApp()
const toast = useToast()

const loading = ref(true)
const error = ref('')
const featuredProducts = ref<any[]>([])
const topCategories = ref<any[]>([])
const cartItemCount = ref(0)

onMounted(async () => {
  await loadData()
  loadCartCount()
})

async function loadData() {
  try {
    loading.value = true
    error.value = ''

    const [productsRes, categoriesRes] = await Promise.all([
      $fetch('/api/shop/produkte', {
        query: {
          istAktiv: 'true',
          istHervorgehoben: 'true',
          limit: 8
        }
      }) as Promise<any>,
      $fetch('/api/shop/kategorien', {
        query: {
          istSichtbar: 'true',
          parentId: 'null',
          limit: 8
        }
      }) as Promise<any>
    ])

    featuredProducts.value = productsRes.products || []
    topCategories.value = categoriesRes.categories || []
  } catch (err: any) {
    console.error('Error loading storefront data:', err)
    error.value = err.message || 'Fehler beim Laden der Daten'
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
