<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/storefront" class="text-2xl font-bold text-primary-600">
              {{ $t('shop.storeName') }}
            </NuxtLink>
          </div>
          <div class="text-sm text-gray-600">
            {{ $t('shop.secureCheckout') }}
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Progress Steps -->
      <div class="mb-8">
        <div class="flex items-center justify-center">
          <div class="flex items-center">
            <div class="flex items-center text-primary-600">
              <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">1</div>
              <span class="ml-2 font-medium">{{ $t('shop.cart') }}</span>
            </div>
            <div class="w-16 h-0.5 bg-primary-600 mx-4"></div>
            <div class="flex items-center text-primary-600">
              <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">2</div>
              <span class="ml-2 font-medium">{{ $t('shop.checkout') }}</span>
            </div>
            <div class="w-16 h-0.5 bg-gray-300 mx-4"></div>
            <div class="flex items-center text-gray-400">
              <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">3</div>
              <span class="ml-2 font-medium">{{ $t('shop.confirmation') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!cartItems || cartItems.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
        <p class="text-gray-600 mb-4">{{ $t('shop.cartEmpty') }}</p>
        <NuxtLink to="/storefront/products" class="btn-primary">
          {{ $t('shop.continueShopping') }}
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Checkout Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Information -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('shop.customerInformation') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.firstName') }} *
                </label>
                <input v-model="form.firstName" type="text" class="input w-full" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.lastName') }} *
                </label>
                <input v-model="form.lastName" type="text" class="input w-full" required />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.email') }} *
                </label>
                <input v-model="form.email" type="email" class="input w-full" required />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.phone') }}
                </label>
                <input v-model="form.phone" type="tel" class="input w-full" />
              </div>
            </div>
          </div>

          <!-- Billing Address -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('shop.billingAddress') }}</h2>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.street') }} *
                </label>
                <input v-model="form.billingStreet" type="text" class="input w-full" required />
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('shop.postalCode') }} *
                  </label>
                  <input v-model="form.billingPostalCode" type="text" class="input w-full" required />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('shop.city') }} *
                  </label>
                  <input v-model="form.billingCity" type="text" class="input w-full" required />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.country') }} *
                </label>
                <input v-model="form.billingCountry" type="text" class="input w-full" value="Deutschland" required />
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">{{ $t('shop.shippingAddress') }}</h2>
              <label class="flex items-center cursor-pointer">
                <input v-model="sameAsBilling" type="checkbox" class="mr-2" />
                <span class="text-sm text-gray-700">{{ $t('shop.sameAsBilling') }}</span>
              </label>
            </div>

            <div v-if="!sameAsBilling" class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.street') }} *
                </label>
                <input v-model="form.shippingStreet" type="text" class="input w-full" required />
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('shop.postalCode') }} *
                  </label>
                  <input v-model="form.shippingPostalCode" type="text" class="input w-full" required />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ $t('shop.city') }} *
                  </label>
                  <input v-model="form.shippingCity" type="text" class="input w-full" required />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('shop.country') }} *
                </label>
                <input v-model="form.shippingCountry" type="text" class="input w-full" value="Deutschland" required />
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('shop.paymentMethod') }}</h2>
            <div class="space-y-3">
              <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input v-model="form.paymentMethod" type="radio" value="Rechnung" class="mr-3" />
                <div>
                  <div class="font-medium">{{ $t('shop.invoice') }}</div>
                  <div class="text-sm text-gray-600">{{ $t('shop.invoiceDescription') }}</div>
                </div>
              </label>
              <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input v-model="form.paymentMethod" type="radio" value="Vorkasse" class="mr-3" />
                <div>
                  <div class="font-medium">{{ $t('shop.bankTransfer') }}</div>
                  <div class="text-sm text-gray-600">{{ $t('shop.bankTransferDescription') }}</div>
                </div>
              </label>
              <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input v-model="form.paymentMethod" type="radio" value="PayPal" class="mr-3" />
                <div>
                  <div class="font-medium">PayPal</div>
                  <div class="text-sm text-gray-600">{{ $t('shop.paypalDescription') }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Order Notes -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('shop.orderNotes') }}</h2>
            <textarea
              v-model="form.notes"
              rows="3"
              class="input w-full"
              :placeholder="$t('shop.orderNotesPlaceholder')"
            ></textarea>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ $t('shop.orderSummary') }}</h2>

            <div class="space-y-3 mb-6 max-h-64 overflow-y-auto">
              <div
                v-for="item in cartItems"
                :key="item.ShopProduktID"
                class="flex justify-between text-sm"
              >
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ item.Titel }}</div>
                  <div class="text-gray-600">{{ item.Menge }}x {{ formatPrice(item.Preis) }}</div>
                </div>
                <div class="font-semibold text-gray-900">
                  {{ formatPrice(item.Preis * item.Menge) }}
                </div>
              </div>
            </div>

            <div class="border-t pt-4 space-y-2 mb-6">
              <div class="flex justify-between text-gray-700">
                <span>{{ $t('shop.subtotal') }}:</span>
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
              <div class="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                <span>{{ $t('shop.total') }}:</span>
                <span>{{ formatPrice(total) }}</span>
              </div>
            </div>

            <button
              @click="placeOrder"
              :disabled="submitting"
              class="btn-primary w-full btn-lg"
              :class="{ 'opacity-50 cursor-not-allowed': submitting }"
            >
              <span v-if="submitting">
                <div class="i-mdi-loading animate-spin inline-block mr-2"></div>
                {{ $t('shop.processing') }}
              </span>
              <span v-else>{{ $t('shop.placeOrder') }}</span>
            </button>

            <p class="text-xs text-gray-600 text-center mt-4">
              {{ $t('shop.termsAgreement') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const router = useRouter()
const toast = useToast()

const cartItems = ref<any[]>([])
const submitting = ref(false)
const sameAsBilling = ref(true)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  billingStreet: '',
  billingPostalCode: '',
  billingCity: '',
  billingCountry: 'Deutschland',
  shippingStreet: '',
  shippingPostalCode: '',
  shippingCity: '',
  shippingCountry: 'Deutschland',
  paymentMethod: 'Rechnung',
  notes: ''
})

const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.Preis * item.Menge), 0)
})

const vatTotal = computed(() => {
  return subtotal.value * 0.19 / 1.19
})

const shipping = computed(() => {
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

function formatPrice(price: number | null | undefined): string {
  if (!price) return '€0.00'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

async function placeOrder() {
  // Validate form
  if (!form.value.firstName || !form.value.lastName || !form.value.email) {
    toast.error('Bitte füllen Sie alle Pflichtfelder aus')
    return
  }

  if (!form.value.billingStreet || !form.value.billingPostalCode || !form.value.billingCity) {
    toast.error('Bitte füllen Sie die Rechnungsadresse vollständig aus')
    return
  }

  if (!sameAsBilling.value) {
    if (!form.value.shippingStreet || !form.value.shippingPostalCode || !form.value.shippingCity) {
      toast.error('Bitte füllen Sie die Lieferadresse vollständig aus')
      return
    }
  }

  if (!form.value.paymentMethod) {
    toast.error('Bitte wählen Sie eine Zahlungsart')
    return
  }

  try {
    submitting.value = true

    // Prepare order data
    const orderData = {
      KundenEmail: form.value.email,
      Kundenname: `${form.value.firstName} ${form.value.lastName}`,
      RechnungsAdresse: `${form.value.billingStreet}, ${form.value.billingPostalCode} ${form.value.billingCity}, ${form.value.billingCountry}`,
      LieferAdresse: sameAsBilling.value
        ? `${form.value.billingStreet}, ${form.value.billingPostalCode} ${form.value.billingCity}, ${form.value.billingCountry}`
        : `${form.value.shippingStreet}, ${form.value.shippingPostalCode} ${form.value.shippingCity}, ${form.value.shippingCountry}`,
      Zahlungsart: form.value.paymentMethod,
      Gesamtbetrag: total.value,
      Nettobetrag: subtotal.value - vatTotal.value,
      Steuerbetrag: vatTotal.value,
      Versandkosten: shipping.value,
      Notizen: form.value.notes || null,
      items: cartItems.value.map(item => ({
        ShopProduktID: item.ShopProduktID,
        Menge: item.Menge,
        Einzelpreis: item.Preis,
        Gesamtpreis: item.Preis * item.Menge
      }))
    }

    // Submit order
    const result = await $fetch('/api/shop/bestellungen', {
      method: 'POST',
      body: orderData
    }) as any

    // Clear cart
    localStorage.removeItem('shopCart')

    // Redirect to success page
    toast.success('Bestellung erfolgreich aufgegeben!')
    router.push(`/storefront/order-success?orderId=${result.ShopBestellID}`)
  } catch (err: any) {
    console.error('Error placing order:', err)
    toast.error(err.message || 'Fehler beim Aufgeben der Bestellung')
  } finally {
    submitting.value = false
  }
}
</script>
