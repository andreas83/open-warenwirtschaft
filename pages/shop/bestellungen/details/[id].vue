<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">
          {{ t('shop.orders.orderDetails') }}
          <span v-if="order" class="text-blue-600">{{ order.Bestellnummer }}</span>
        </h1>
        <p class="text-gray-600 mt-1">{{ t('shop.orders.detailsSubtitle') }}</p>
      </div>
      <NuxtLink
        to="/shop/bestellungen"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-arrow-left text-xl"></span>
        {{ t('common.back') }}
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Order Items -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ t('shop.orders.orderItems') }}</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ t('shop.orders.product') }}</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{{ t('shop.orders.quantity') }}</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{{ t('shop.orders.unitPrice') }}</th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{{ t('shop.orders.total') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="item in order.ShopBestellpositionen" :key="item.ShopBestellpositionID">
                  <td class="px-4 py-4">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ item.Produktname }}</div>
                        <div v-if="item.Artikelnummer" class="text-xs text-gray-500">{{ item.Artikelnummer }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-center text-sm text-gray-500">{{ item.Menge }}</td>
                  <td class="px-4 py-4 text-right text-sm text-gray-500">{{ formatPrice(item.EinzelpreisBrutto) }}</td>
                  <td class="px-4 py-4 text-right text-sm font-medium text-gray-900">{{ formatPrice(item.GesamtpreisBrutto) }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="3" class="px-4 py-3 text-right text-sm font-medium text-gray-700">{{ t('shop.orders.subtotal') }}</td>
                  <td class="px-4 py-3 text-right text-sm font-medium text-gray-900">{{ formatPrice(order.WarensummeNetto) }}</td>
                </tr>
                <tr v-if="order.Versandkosten > 0">
                  <td colspan="3" class="px-4 py-3 text-right text-sm text-gray-700">{{ t('shop.orders.shipping') }}</td>
                  <td class="px-4 py-3 text-right text-sm text-gray-900">{{ formatPrice(order.Versandkosten) }}</td>
                </tr>
                <tr>
                  <td colspan="3" class="px-4 py-3 text-right text-sm text-gray-700">{{ t('shop.orders.vat') }}</td>
                  <td class="px-4 py-3 text-right text-sm text-gray-900">{{ formatPrice(order.MwStGesamt) }}</td>
                </tr>
                <tr class="border-t-2 border-gray-300">
                  <td colspan="3" class="px-4 py-3 text-right text-lg font-bold text-gray-800">{{ t('shop.orders.grandTotal') }}</td>
                  <td class="px-4 py-3 text-right text-lg font-bold text-blue-600">{{ formatPrice(order.GesamtsummeBrutto) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Addresses -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Billing Address -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="i-mdi-receipt text-xl text-gray-500"></span>
              {{ t('shop.orders.billingAddress') }}
            </h3>
            <div class="text-sm text-gray-600 space-y-1">
              <p class="font-medium text-gray-900">{{ order.RechnungsVorname }} {{ order.RechnungsNachname }}</p>
              <p v-if="order.RechnungsFirma">{{ order.RechnungsFirma }}</p>
              <p>{{ order.RechnungsStrasse }}</p>
              <p>{{ order.RechnungsPLZ }} {{ order.RechnungsOrt }}</p>
              <p>{{ order.RechnungsLand }}</p>
              <p class="pt-2">{{ order.RechnungsEmail }}</p>
              <p v-if="order.RechnungsTelefon">{{ order.RechnungsTelefon }}</p>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="i-mdi-truck-delivery text-xl text-gray-500"></span>
              {{ t('shop.orders.shippingAddress') }}
            </h3>
            <div class="text-sm text-gray-600 space-y-1">
              <p class="font-medium text-gray-900">{{ order.LieferVorname }} {{ order.LieferNachname }}</p>
              <p v-if="order.LieferFirma">{{ order.LieferFirma }}</p>
              <p>{{ order.LieferStrasse }}</p>
              <p>{{ order.LieferPLZ }} {{ order.LieferOrt }}</p>
              <p>{{ order.LieferLand }}</p>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.Kundennotizen || order.InterneNotizen" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ t('shop.orders.notes') }}</h3>
          <div v-if="order.Kundennotizen" class="mb-4">
            <p class="text-sm font-medium text-gray-700">{{ t('shop.orders.customerNotes') }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ order.Kundennotizen }}</p>
          </div>
          <div v-if="order.InterneNotizen">
            <p class="text-sm font-medium text-gray-700">{{ t('shop.orders.internalNotes') }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ order.InterneNotizen }}</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Order Status -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ t('shop.orders.orderStatus') }}</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">{{ t('common.status') }}</p>
              <span :class="getStatusClass(order.Status)" class="px-3 py-1 text-sm font-semibold rounded-full inline-block mt-1">
                {{ getStatusText(order.Status) }}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ t('shop.orders.paymentStatus') }}</p>
              <span :class="getPaymentStatusClass(order.Zahlungsstatus)" class="px-3 py-1 text-sm font-semibold rounded-full inline-block mt-1">
                {{ getPaymentStatusText(order.Zahlungsstatus) }}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ t('shop.orders.shippingStatus') }}</p>
              <span :class="getShippingStatusClass(order.Versandstatus)" class="px-3 py-1 text-sm font-semibold rounded-full inline-block mt-1">
                {{ getShippingStatusText(order.Versandstatus) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Update Status -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ t('shop.orders.updateStatus') }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('shop.orders.orderStatus') }}</label>
              <select v-model="newStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Neu">{{ t('shop.orders.status.new') }}</option>
                <option value="In_Bearbeitung">{{ t('shop.orders.status.processing') }}</option>
                <option value="Versendet">{{ t('shop.orders.status.shipped') }}</option>
                <option value="Zugestellt">{{ t('shop.orders.status.delivered') }}</option>
                <option value="Abgeschlossen">{{ t('shop.orders.status.completed') }}</option>
                <option value="Storniert">{{ t('shop.orders.status.cancelled') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('shop.orders.paymentStatus') }}</label>
              <select v-model="newPaymentStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Ausstehend">{{ t('shop.orders.payment.pending') }}</option>
                <option value="Bezahlt">{{ t('shop.orders.payment.paid') }}</option>
                <option value="Teilbezahlt">{{ t('shop.orders.payment.partiallyPaid') }}</option>
                <option value="Fehlgeschlagen">{{ t('shop.orders.payment.failed') }}</option>
              </select>
            </div>
            <button
              @click="updateStatus"
              :disabled="updating"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              {{ t('shop.orders.saveStatus') }}
            </button>
          </div>
        </div>

        <!-- Order Info -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ t('shop.orders.orderInfo') }}</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">{{ t('shop.orders.orderNumber') }}</span>
              <span class="font-medium text-gray-900">{{ order.Bestellnummer }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">{{ t('shop.orders.orderDate') }}</span>
              <span class="text-gray-900">{{ formatDate(order.Bestelldatum) }}</span>
            </div>
            <div v-if="order.Zahlungsart" class="flex justify-between">
              <span class="text-gray-500">{{ t('shop.orders.paymentMethod') }}</span>
              <span class="text-gray-900">{{ order.Zahlungsart }}</span>
            </div>
            <div v-if="order.Versandart" class="flex justify-between">
              <span class="text-gray-500">{{ t('shop.orders.shippingMethod') }}</span>
              <span class="text-gray-900">{{ order.Versandart }}</span>
            </div>
            <div v-if="order.Trackingnummer" class="flex justify-between">
              <span class="text-gray-500">{{ t('shop.orders.trackingNumber') }}</span>
              <span class="text-gray-900">{{ order.Trackingnummer }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const orderId = computed(() => parseInt(route.params.id))
const loading = ref(true)
const updating = ref(false)
const order = ref(null)
const newStatus = ref('')
const newPaymentStatus = ref('')

const loadOrder = async () => {
  loading.value = true
  try {
    order.value = await $fetch(`/api/shop/bestellungen?id=${orderId.value}`)
    newStatus.value = order.value.Status
    newPaymentStatus.value = order.value.Zahlungsstatus
  } catch (error) {
    toast.error(t('common.error'))
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  updating.value = true
  try {
    await $fetch(`/api/shop/bestellungen?id=${orderId.value}`, {
      method: 'PUT',
      body: {
        Status: newStatus.value,
        Zahlungsstatus: newPaymentStatus.value
      }
    })
    order.value.Status = newStatus.value
    order.value.Zahlungsstatus = newPaymentStatus.value
    toast.success(t('shop.orders.statusUpdated'))
  } catch (error) {
    toast.error(error.data?.message || t('common.error'))
  } finally {
    updating.value = false
  }
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
  }).format(price || 0)
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

const getShippingStatusClass = (status) => {
  const classes = {
    NichtVersendet: 'bg-gray-100 text-gray-800',
    Vorbereitung: 'bg-yellow-100 text-yellow-800',
    Versendet: 'bg-blue-100 text-blue-800',
    Unterwegs: 'bg-indigo-100 text-indigo-800',
    Zugestellt: 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getShippingStatusText = (status) => {
  const texts = {
    NichtVersendet: t('shop.orders.shipping.notShipped'),
    Vorbereitung: t('shop.orders.shipping.preparing'),
    Versendet: t('shop.orders.shipping.shipped'),
    Unterwegs: t('shop.orders.shipping.inTransit'),
    Zugestellt: t('shop.orders.shipping.delivered')
  }
  return texts[status] || status
}

onMounted(() => {
  loadOrder()
})
</script>
