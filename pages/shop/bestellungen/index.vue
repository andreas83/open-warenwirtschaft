<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ t('shop.orders.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ t('shop.orders.subtitle') }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('common.search') }}
          </label>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('shop.orders.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debounceSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.orders.orderStatus') }}
          </label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadOrders"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="Neu">{{ t('shop.orders.status.new') }}</option>
            <option value="In_Bearbeitung">{{ t('shop.orders.status.processing') }}</option>
            <option value="Versendet">{{ t('shop.orders.status.shipped') }}</option>
            <option value="Zugestellt">{{ t('shop.orders.status.delivered') }}</option>
            <option value="Abgeschlossen">{{ t('shop.orders.status.completed') }}</option>
            <option value="Storniert">{{ t('shop.orders.status.cancelled') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.orders.paymentStatus') }}
          </label>
          <select
            v-model="filterZahlungsstatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadOrders"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="Ausstehend">{{ t('shop.orders.payment.pending') }}</option>
            <option value="Bezahlt">{{ t('shop.orders.payment.paid') }}</option>
            <option value="Teilbezahlt">{{ t('shop.orders.payment.partiallyPaid') }}</option>
            <option value="Fehlgeschlagen">{{ t('shop.orders.payment.failed') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.orders.shippingStatus') }}
          </label>
          <select
            v-model="filterVersandstatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadOrders"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="NichtVersendet">{{ t('shop.orders.shipping.notShipped') }}</option>
            <option value="Vorbereitung">{{ t('shop.orders.shipping.preparing') }}</option>
            <option value="Versendet">{{ t('shop.orders.shipping.shipped') }}</option>
            <option value="Unterwegs">{{ t('shop.orders.shipping.inTransit') }}</option>
            <option value="Zugestellt">{{ t('shop.orders.shipping.delivered') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Orders Table -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.orders.orderNumber') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.orders.customer') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.orders.orderDate') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.orders.total') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('common.status') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.orders.payment') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in orders" :key="order.ShopBestellID" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ order.Bestellnummer }}</div>
              <div class="text-sm text-gray-500">{{ order._count.ShopBestellpositionen }} {{ t('shop.orders.items') }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ order.RechnungsVorname }} {{ order.RechnungsNachname }}</div>
              <div class="text-sm text-gray-500">{{ order.RechnungsEmail }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(order.Bestelldatum) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ formatPrice(order.GesamtsummeBrutto) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getStatusClass(order.Status)"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getStatusText(order.Status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getPaymentStatusClass(order.Zahlungsstatus)"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getPaymentStatusText(order.Zahlungsstatus) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink
                :to="`/shop/bestellungen/details/${order.ShopBestellID}`"
                class="text-blue-600 hover:text-blue-900"
              >
                {{ t('shop.orders.viewDetails') }}
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && orders.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
      <span class="i-mdi-cart-outline text-6xl text-gray-400 mb-4"></span>
      <p class="text-gray-500 text-lg">{{ t('shop.orders.noOrders') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="mt-6 flex justify-center gap-2">
      <button
        @click="goToPage(0)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.first') }}
      </button>
      <button
        @click="goToPage(offset - limit)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.previous') }}
      </button>
      <span class="px-3 py-1">
        {{ Math.floor(offset / limit) + 1 }} / {{ Math.ceil(total / limit) }}
      </span>
      <button
        @click="goToPage(offset + limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.next') }}
      </button>
      <button
        @click="goToPage(Math.floor(total / limit) * limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.last') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const loading = ref(true)
const orders = ref([])
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const searchQuery = ref('')
const filterStatus = ref('')
const filterZahlungsstatus = ref('')
const filterVersandstatus = ref('')
let debounceTimer = null

const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      limit: limit.value,
      offset: offset.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterZahlungsstatus.value) params.zahlungsstatus = filterZahlungsstatus.value
    if (filterVersandstatus.value) params.versandstatus = filterVersandstatus.value

    const data = await $fetch('/api/shop/bestellungen', { params })
    orders.value = data.orders
    total.value = data.total
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    offset.value = 0
    loadOrders()
  }, 300)
}

const goToPage = (newOffset) => {
  offset.value = newOffset
  loadOrders()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const getStatusClass = (status) => {
  const classes = {
    Neu: 'bg-blue-100 text-blue-800',
    In_Bearbeitung: 'bg-yellow-100 text-yellow-800',
    Versendet: 'bg-indigo-100 text-indigo-800',
    Zugestellt: 'bg-green-100 text-green-800',
    Abgeschlossen: 'bg-gray-100 text-gray-800',
    Storniert: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    Neu: t('shop.orders.status.new'),
    In_Bearbeitung: t('shop.orders.status.processing'),
    Versendet: t('shop.orders.status.shipped'),
    Zugestellt: t('shop.orders.status.delivered'),
    Abgeschlossen: t('shop.orders.status.completed'),
    Storniert: t('shop.orders.status.cancelled')
  }
  return texts[status] || status
}

const getPaymentStatusClass = (status) => {
  const classes = {
    Ausstehend: 'bg-yellow-100 text-yellow-800',
    Bezahlt: 'bg-green-100 text-green-800',
    Teilbezahlt: 'bg-orange-100 text-orange-800',
    Fehlgeschlagen: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPaymentStatusText = (status) => {
  const texts = {
    Ausstehend: t('shop.orders.payment.pending'),
    Bezahlt: t('shop.orders.payment.paid'),
    Teilbezahlt: t('shop.orders.payment.partiallyPaid'),
    Fehlgeschlagen: t('shop.orders.payment.failed')
  }
  return texts[status] || status
}

onMounted(() => {
  loadOrders()
})
</script>
