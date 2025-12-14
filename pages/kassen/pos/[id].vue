<template>
  <div class="h-full flex">
    <!-- Left: Product Search -->
    <div class="flex-1 flex flex-col overflow-hidden" :class="{'bg-white': !darkMode, 'bg-gray-800': darkMode}">
      <PosProductSearch
        :dark-mode="darkMode"
        @add-to-cart="addToCart"
      />
    </div>

    <!-- Right: Cart and Payment -->
    <div class="w-96 flex flex-col border-l" :class="{'border-gray-200 bg-gray-50': !darkMode, 'border-gray-700 bg-gray-900': darkMode}">
      <!-- Cart -->
      <div class="flex-1 overflow-hidden">
        <PosCart
          :items="cart"
          :dark-mode="darkMode"
          @update-quantity="updateQuantity"
          @remove-item="removeItem"
          @clear-cart="clearCart"
        />
      </div>

      <!-- Payment -->
      <div class="border-t" :class="{'border-gray-200': !darkMode, 'border-gray-700': darkMode}">
        <PosPayment
          :total="cartTotal"
          :dark-mode="darkMode"
          :processing="processing"
          @checkout="handleCheckout"
        />
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccess" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="i-mdi-check-circle w-12 h-12 text-green-500"></span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ $t('pos.paymentSuccessful') }}</h2>
          <p class="text-gray-600 mb-4">{{ $t('pos.invoiceCreated') }}: {{ lastInvoiceNumber }}</p>
          <div class="text-3xl font-bold text-green-600 mb-6">{{ formatCurrency(lastTotal) }}</div>
          <div v-if="changeAmount > 0" class="bg-yellow-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-yellow-700">{{ $t('pos.change') }}</p>
            <p class="text-2xl font-bold text-yellow-600">{{ formatCurrency(changeAmount) }}</p>
          </div>
          <button
            @click="closeSuccessModal"
            class="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition-colors">
            {{ $t('pos.newSale') }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'pos'
})

const route = useRoute()
const darkMode = inject('darkMode', ref(false))
const updateKassenBestand = inject('updateKassenBestand', () => {})

const kassenId = ref(route.params.id)
const kasse = ref(null)
const cart = ref([])
const processing = ref(false)
const showSuccess = ref(false)
const lastInvoiceNumber = ref('')
const lastTotal = ref(0)
const changeAmount = ref(0)

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.preis * item.menge), 0)
})

const cartTotalNetto = computed(() => {
  return cart.value.reduce((sum, item) => {
    const mwstFaktor = 1 + (item.mwstSatz / 100)
    return sum + ((item.preis / mwstFaktor) * item.menge)
  }, 0)
})

const cartMwst = computed(() => {
  return cartTotal.value - cartTotalNetto.value
})

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
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

function getProductMwst(product) {
  // MwSt comes from Umsatzsteuersaetze relation via Produkte
  if (product.Umsatzsteuersaetze?.Steuersatz) {
    return parseFloat(product.Umsatzsteuersaetze.Steuersatz)
  }
  return 19 // Default German VAT
}

function addToCart(product) {
  const existingItem = cart.value.find(item => item.produktId === product.ProduktID)

  if (existingItem) {
    existingItem.menge++
  } else {
    // Get current price and MwSt
    const currentPrice = getProductPrice(product)
    const mwstSatz = getProductMwst(product)

    cart.value.push({
      produktId: product.ProduktID,
      name: product.Produktname,
      preis: currentPrice,
      menge: 1,
      mwstSatz: mwstSatz,
      bild: product.ProduktBilder?.[0]?.BildPfad || null
    })
  }
}

function updateQuantity(index, newQuantity) {
  if (newQuantity <= 0) {
    cart.value.splice(index, 1)
  } else {
    cart.value[index].menge = newQuantity
  }
}

function removeItem(index) {
  cart.value.splice(index, 1)
}

function clearCart() {
  cart.value = []
}

async function handleCheckout(paymentData) {
  if (cart.value.length === 0) return

  processing.value = true

  try {
    const response = await $fetch('/api/kassen/checkout', {
      method: 'POST',
      body: {
        KassenID: parseInt(kassenId.value),
        items: cart.value.map(item => ({
          ProduktID: item.produktId,
          Menge: item.menge,
          EinzelpreisBrutto: item.preis,
          MwSt_Satz: item.mwstSatz
        })),
        Zahlungsart: paymentData.method,
        GegebenBetrag: paymentData.receivedAmount || cartTotal.value
      }
    })

    if (response.success) {
      lastInvoiceNumber.value = response.rechnungsnummer
      lastTotal.value = cartTotal.value
      changeAmount.value = paymentData.receivedAmount
        ? paymentData.receivedAmount - cartTotal.value
        : 0

      // Update kassen balance in layout
      if (response.neuerKassenbestand !== undefined) {
        updateKassenBestand(response.neuerKassenbestand)
      }

      showSuccess.value = true
    } else {
      alert(response.message || 'Fehler beim Checkout')
    }
  } catch (err) {
    console.error('Checkout error:', err)
    alert('Fehler beim Checkout: ' + (err.message || err))
  } finally {
    processing.value = false
  }
}

function closeSuccessModal() {
  showSuccess.value = false
  cart.value = []
  lastInvoiceNumber.value = ''
  lastTotal.value = 0
  changeAmount.value = 0
}

async function fetchKasse() {
  try {
    const response = await $fetch(`/api/kassen?id=${kassenId.value}`)
    if (response.KassenID) {
      kasse.value = response
    }
  } catch (err) {
    console.error('Error fetching kasse:', err)
  }
}

onMounted(() => {
  fetchKasse()
})
</script>

<style scoped>
.h-full {
  height: calc(100vh - 3.5rem);
}
</style>
