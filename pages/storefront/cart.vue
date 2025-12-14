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
            <button class="relative p-2 text-primary-600">
              <div class="i-mdi-cart text-2xl"></div>
              <span v-if="cartItems.length > 0" class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{ cartItems.length }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ $t('shop.shoppingCart') }}</h1>

      <div v-if="cartItems.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
        <div class="i-mdi-cart-outline text-6xl text-gray-400 mb-4"></div>
        <p class="text-gray-600 text-lg mb-6">{{ $t('shop.cartEmpty') }}</p>
        <NuxtLink to="/storefront/products" class="btn-primary">
          {{ $t('shop.continueShopping') }}
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in cartItems"
            :key="item.ShopProduktID"
            class="bg-white rounded-lg shadow-md p-6"
          >
            <div class="flex gap-6">
              <!-- Product Image -->
              <div class="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  v-if="item.Hauptbild"
                  :src="item.Hauptbild"
                  :alt="item.Titel"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <div class="i-mdi-image text-4xl text-gray-400"></div>
                </div>
              </div>

              <!-- Product Info -->
              <div class="flex-1">
                <h3 class="font-semibold text-lg text-gray-900 mb-2">
                  {{ item.Titel }}
                </h3>

                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-lg font-bold text-primary-600">
                      {{ formatPrice(item.Preis) }}
                    </span>
                    <span class="text-sm text-gray-600 ml-2">
                      {{ $t('shop.perUnit') }}
                    </span>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="flex items-center gap-2">
                    <button
                      @click="decreaseQuantity(item)"
                      class="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <div class="i-mdi-minus text-sm"></div>
                    </button>
                    <span class="w-12 text-center font-semibold">{{ item.Menge }}</span>
                    <button
                      @click="increaseQuantity(item)"
                      class="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <div class="i-mdi-plus text-sm"></div>
                    </button>
                  </div>

                  <!-- Item Total -->
                  <div class="text-right">
                    <div class="font-bold text-lg text-gray-900">
                      {{ formatPrice(item.Preis * item.Menge) }}
                    </div>
                    <button
                      @click="removeItem(item)"
                      class="text-sm text-red-600 hover:text-red-800 mt-1"
                    >
                      {{ $t('shop.remove') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('shop.orderSummary') }}</h2>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-gray-700">
                <span>{{ $t('shop.subtotal') }} ({{ cartItems.length }} {{ $t('shop.items') }}):</span>
                <span class="font-semibold">{{ formatPrice(subtotal) }}</span>
              </div>

              <div class="flex justify-between text-gray-700">
                <span>{{ $t('shop.vat') }}:</span>
                <span class="font-semibold">{{ formatPrice(vatTotal) }}</span>
              </div>

              <div class="flex justify-between text-gray-700">
                <span>{{ $t('shop.shipping') }}:</span>
                <span class="font-semibold">{{ shipping > 0 ? formatPrice(shipping) : $t('shop.free') }}</span>
              </div>

              <div class="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>{{ $t('shop.total') }}:</span>
                <span>{{ formatPrice(total) }}</span>
              </div>
            </div>

            <button @click="proceedToCheckout" class="btn-primary w-full btn-lg mb-3">
              {{ $t('shop.proceedToCheckout') }}
            </button>

            <NuxtLink to="/storefront/products" class="btn-secondary w-full block text-center">
              {{ $t('shop.continueShopping') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
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

const router = useRouter()
const toast = useToast()

const cartItems = ref<any[]>([])

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.Preis * item.Menge), 0)
})

const vatTotal = computed(() => {
  // Assuming 19% VAT included in price
  return subtotal.value * 0.19 / 1.19
})

const shipping = computed(() => {
  // Free shipping over 50€
  return subtotal.value >= 50 ? 0 : 4.99
})

const total = computed(() => {
  return subtotal.value + shipping.value
})

onMounted(() => {
  loadCart()
})

function loadCart() {
  const cart = localStorage.getItem('shopCart')
  if (cart) {
    try {
      const cartData = JSON.parse(cart)
      cartItems.value = cartData.items || []
    } catch (e) {
      console.error('Error parsing cart:', e)
      cartItems.value = []
    }
  }
}

function saveCart() {
  localStorage.setItem('shopCart', JSON.stringify({ items: cartItems.value }))
}

function increaseQuantity(item: any) {
  item.Menge++
  saveCart()
}

function decreaseQuantity(item: any) {
  if (item.Menge > 1) {
    item.Menge--
    saveCart()
  }
}

function removeItem(item: any) {
  const index = cartItems.value.findIndex(i => i.ShopProduktID === item.ShopProduktID)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    saveCart()
    toast.success('Artikel aus dem Warenkorb entfernt')
  }
}

function formatPrice(price: number | null | undefined): string {
  if (!price) return '€0.00'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

async function proceedToCheckout() {
  if (cartItems.value.length === 0) {
    toast.error('Ihr Warenkorb ist leer')
    return
  }

  try {
    // Validate cart before checkout
    const validation = await $fetch('/api/shop/warenkorb/validate', {
      method: 'POST',
      body: { items: cartItems.value }
    }) as any

    if (!validation.allValid) {
      const invalidItems = validation.items.filter((item: any) => !item.valid)
      invalidItems.forEach((item: any) => {
        toast.error(`${item.Titel}: ${item.error}`)
      })

      // Update cart with validated items
      cartItems.value = validation.items.filter((item: any) => item.valid)
      saveCart()
      return
    }

    // Proceed to checkout
    router.push('/storefront/checkout')
  } catch (err: any) {
    console.error('Error validating cart:', err)
    toast.error('Fehler beim Validieren des Warenkorbs')
  }
}
</script>
