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
      <div v-if="loading" class="text-center py-12">
        <div class="i-mdi-loading animate-spin text-4xl text-primary-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-12 text-red-600">
        {{ error }}
      </div>

      <div v-else-if="product">
        <!-- Breadcrumb -->
        <nav class="text-sm text-gray-600 mb-6">
          <NuxtLink to="/storefront" class="hover:text-primary-600">{{ $t('storefront.home') }}</NuxtLink>
          <span class="mx-2">/</span>
          <NuxtLink to="/storefront/products" class="hover:text-primary-600">{{ $t('storefront.products') }}</NuxtLink>
          <span v-if="product.ShopKategorien" class="mx-2">/</span>
          <span v-if="product.ShopKategorien">{{ product.ShopKategorien.Name }}</span>
        </nav>

        <!-- Product Details -->
        <div class="bg-white rounded-lg shadow-md p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Product Image -->
            <div>
              <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img
                  v-if="product.Hauptbild"
                  :src="product.Hauptbild"
                  :alt="product.Titel"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <div class="i-mdi-image text-9xl text-gray-400"></div>
                </div>
              </div>

              <!-- Additional Images -->
              <div v-if="product.Bilder && product.Bilder.length > 0" class="grid grid-cols-4 gap-2">
                <div
                  v-for="(image, index) in product.Bilder.slice(0, 4)"
                  :key="index"
                  class="aspect-square bg-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-75"
                >
                  <img :src="image" :alt="`${product.Titel} ${index + 1}`" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <!-- Product Info -->
            <div>
              <div v-if="product.ShopKategorien" class="text-sm text-gray-600 mb-2">
                {{ product.ShopKategorien.Name }}
              </div>

              <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.Titel }}</h1>

              <div v-if="product.SKU" class="text-sm text-gray-600 mb-4">
                SKU: {{ product.SKU }}
              </div>

              <!-- Reviews -->
              <div v-if="reviewCount > 0" class="flex items-center gap-2 mb-4">
                <div class="flex items-center">
                  <div class="i-mdi-star text-yellow-500 text-xl"></div>
                  <div class="i-mdi-star text-yellow-500 text-xl"></div>
                  <div class="i-mdi-star text-yellow-500 text-xl"></div>
                  <div class="i-mdi-star text-yellow-500 text-xl"></div>
                  <div class="i-mdi-star-outline text-yellow-500 text-xl"></div>
                </div>
                <span class="text-sm text-gray-600">
                  ({{ reviewCount }} {{ $t('storefront.reviews') }})
                </span>
              </div>

              <!-- Price -->
              <div class="mb-6">
                <div v-if="product.Angebotspreis" class="flex items-center gap-3">
                  <span class="text-2xl text-gray-500 line-through">
                    {{ formatPrice(product.Preis) }}
                  </span>
                  <span class="text-3xl font-bold text-red-600">
                    {{ formatPrice(product.Angebotspreis) }}
                  </span>
                  <span class="badge-danger">{{ $t('storefront.sale') }}</span>
                </div>
                <div v-else class="text-3xl font-bold text-primary-600">
                  {{ formatPrice(product.Preis) }}
                </div>

                <div v-if="product.Produkte?.Umsatzsteuersaetze" class="text-sm text-gray-600 mt-1">
                  {{ $t('storefront.inclVat', { vat: product.Produkte.Umsatzsteuersaetze.Satz }) }}
                </div>
              </div>

              <!-- Short Description -->
              <div v-if="product.Kurzbeschreibung" class="text-gray-700 mb-6">
                {{ product.Kurzbeschreibung }}
              </div>

              <!-- Stock Status -->
              <div class="mb-6">
                <div v-if="product.Lagerbestand > 0" class="flex items-center text-green-600">
                  <div class="i-mdi-check-circle mr-2"></div>
                  <span>{{ $t('storefront.inStock') }} ({{ product.Lagerbestand }} {{ $t('storefront.available') }})</span>
                </div>
                <div v-else class="flex items-center text-red-600">
                  <div class="i-mdi-alert-circle mr-2"></div>
                  <span>{{ $t('storefront.outOfStock') }}</span>
                </div>
              </div>

              <!-- Quantity Selector -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('storefront.quantity') }}
                </label>
                <div class="flex items-center gap-3">
                  <button
                    @click="decreaseQuantity"
                    class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    :disabled="quantity <= 1"
                  >
                    <div class="i-mdi-minus"></div>
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    :max="product.Lagerbestand"
                    class="input w-20 text-center"
                  />
                  <button
                    @click="increaseQuantity"
                    class="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    :disabled="quantity >= product.Lagerbestand"
                  >
                    <div class="i-mdi-plus"></div>
                  </button>
                </div>
              </div>

              <!-- Add to Cart Button -->
              <button
                @click="addToCart"
                :disabled="product.Lagerbestand <= 0"
                class="btn-primary btn-lg w-full mb-4"
                :class="{ 'opacity-50 cursor-not-allowed': product.Lagerbestand <= 0 }"
              >
                <div class="i-mdi-cart-plus mr-2"></div>
                {{ $t('storefront.addToCart') }}
              </button>

              <button @click="buyNow" class="btn-secondary btn-lg w-full">
                {{ $t('storefront.buyNow') }}
              </button>
            </div>
          </div>

          <!-- Product Description -->
          <div v-if="product.Beschreibung" class="mt-12 border-t pt-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('storefront.description') }}</h2>
            <div class="prose max-w-none text-gray-700" v-html="product.Beschreibung"></div>
          </div>

          <!-- Product Specifications -->
          <div v-if="product.Produkte" class="mt-12 border-t pt-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('storefront.specifications') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="product.Produkte.Einheiten" class="flex justify-between py-2 border-b">
                <span class="font-medium text-gray-700">{{ $t('storefront.unit') }}:</span>
                <span class="text-gray-900">{{ product.Produkte.Einheiten.Name }}</span>
              </div>
              <div v-if="product.Gewicht" class="flex justify-between py-2 border-b">
                <span class="font-medium text-gray-700">{{ $t('storefront.weight') }}:</span>
                <span class="text-gray-900">{{ product.Gewicht }} kg</span>
              </div>
              <div v-if="product.Dimensionen" class="flex justify-between py-2 border-b">
                <span class="font-medium text-gray-700">{{ $t('storefront.dimensions') }}:</span>
                <span class="text-gray-900">{{ product.Dimensionen }}</span>
              </div>
            </div>
          </div>

          <!-- Reviews Section -->
          <div v-if="product.ShopBewertungen && product.ShopBewertungen.length > 0" class="mt-12 border-t pt-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('storefront.customerReviews') }}</h2>
            <div class="space-y-6">
              <div
                v-for="review in product.ShopBewertungen"
                :key="review.BewertungID"
                class="border-b pb-6 last:border-0"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="flex">
                      <div
                        v-for="i in 5"
                        :key="i"
                        :class="i <= review.Bewertung ? 'i-mdi-star text-yellow-500' : 'i-mdi-star-outline text-gray-300'"
                      ></div>
                    </div>
                    <span class="font-medium text-gray-900">{{ review.Kundenname || 'Anonymous' }}</span>
                  </div>
                  <span class="text-sm text-gray-600">
                    {{ formatDate(review.Erstelldatum) }}
                  </span>
                </div>
                <p class="text-gray-700">{{ review.Kommentar }}</p>
              </div>
            </div>
          </div>
        </div>
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
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const error = ref('')
const product = ref<any>(null)
const quantity = ref(1)
const cartItemCount = ref(0)

const reviewCount = computed(() => product.value?._count?.ShopBewertungen || 0)

onMounted(async () => {
  await loadProduct()
  loadCartCount()
})

async function loadProduct() {
  try {
    loading.value = true
    error.value = ''

    const id = route.params.id
    product.value = await $fetch('/api/shop/produkte', {
      query: { id }
    }) as any
  } catch (err: any) {
    console.error('Error loading product:', err)
    error.value = err.message || 'Fehler beim Laden des Produkts'
  } finally {
    loading.value = false
  }
}

function increaseQuantity() {
  if (quantity.value < product.value.Lagerbestand) {
    quantity.value++
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--
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

function formatDate(date: any): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('de-DE')
}

async function addToCart() {
  try {
    const cart = localStorage.getItem('shopCart')
    let cartData = cart ? JSON.parse(cart) : { items: [] }

    const existingItem = cartData.items.find((item: any) => item.ShopProduktID === product.value.ShopProduktID)

    if (existingItem) {
      existingItem.Menge += quantity.value
    } else {
      cartData.items.push({
        ShopProduktID: product.value.ShopProduktID,
        Titel: product.value.Titel,
        Preis: product.value.Angebotspreis || product.value.Preis,
        Hauptbild: product.value.Hauptbild,
        Menge: quantity.value
      })
    }

    localStorage.setItem('shopCart', JSON.stringify(cartData))
    cartItemCount.value = cartData.items.length

    toast.success(`${quantity.value}x ${product.value.Titel} zum Warenkorb hinzugefügt`)
    quantity.value = 1
  } catch (err) {
    console.error('Error adding to cart:', err)
    toast.error('Fehler beim Hinzufügen zum Warenkorb')
  }
}

async function buyNow() {
  await addToCart()
  router.push('/storefront/cart')
}
</script>
