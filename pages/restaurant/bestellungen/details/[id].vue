<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div v-if="loading" class="card p-12 text-center text-secondary-500">
      <span class="i-mdi-loading animate-spin w-8 h-8 mx-auto mb-4"></span>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <div v-else-if="error" class="card p-12 text-center text-danger-600">
      <span class="i-mdi-alert-circle w-8 h-8 mx-auto mb-4"></span>
      <p>{{ error }}</p>
      <Button variant="secondary" class="mt-4" @click="navigateTo('/restaurant/bestellungen')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ bestellung.Bestellnummer || `#${bestellung.RestaurantBestellID}` }}</h1>
          <p class="text-secondary-500">{{ formatDateTime(bestellung.Bestelldatum) }}</p>
        </div>
        <span :class="getStatusBadgeClass(bestellung.Status)" class="text-base">
          {{ formatStatus(bestellung.Status) }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Table Info -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.tableInfo', 'Tischinformationen') }}</h2>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 flex items-center justify-center bg-primary-100 text-primary-700 rounded-xl">
                <span class="text-2xl font-bold">{{ bestellung.RestaurantTische?.Tischnummer }}</span>
              </div>
              <div>
                <p class="font-medium text-secondary-900">{{ bestellung.RestaurantTische?.Tischname || `Tisch ${bestellung.RestaurantTische?.Tischnummer}` }}</p>
                <p class="text-sm text-secondary-500">{{ bestellung.RestaurantTische?.Tischbereiche?.Name || '' }}</p>
                <p class="text-sm text-secondary-500">
                  {{ bestellung.PersonenAnzahl || 1 }} {{ $t('restaurant.orders.guests', 'Gaste') }} /
                  {{ bestellung.RestaurantTische?.Kapazitaet }} {{ $t('restaurant.orders.capacity', 'Platze') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.items', 'Bestellpositionen') }}</h2>

            <div v-if="!bestellung.RestaurantBestellpositionen?.length" class="text-center py-8 text-secondary-500">
              {{ $t('restaurant.orders.noItems', 'Keine Artikel') }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="pos in bestellung.RestaurantBestellpositionen"
                :key="pos.BestellpositionID"
                class="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
              >
                <div class="flex-1">
                  <div class="font-medium text-secondary-900">{{ pos.Produkte?.Produktname || 'Unbekanntes Produkt' }}</div>
                  <div class="text-sm text-secondary-500">{{ formatCurrency(pos.EinzelpreisNetto) }} x {{ pos.Menge }}</div>
                  <div v-if="pos.Notiz" class="text-sm text-info-600 mt-1">
                    <span class="i-mdi-note-text mr-1"></span>{{ pos.Notiz }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-secondary-900">{{ formatCurrency(pos.GesamtpreisNetto) }}</div>
                  <span :class="getPositionStatusBadge(pos.Status)" class="text-xs">
                    {{ formatPositionStatus(pos.Status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="bestellung.Notizen" class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.notes', 'Notizen') }}</h2>
            <p class="text-secondary-700 whitespace-pre-wrap">{{ bestellung.Notizen }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Summary -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.summary', 'Zusammenfassung') }}</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('restaurant.orders.itemCount', 'Artikel') }}</span>
                <span class="text-secondary-900">{{ bestellung.RestaurantBestellpositionen?.length || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('restaurant.orders.subtotal', 'Netto') }}</span>
                <span class="text-secondary-900">{{ formatCurrency(bestellung.GesamtbetragNetto) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('restaurant.orders.vat', 'MwSt.') }}</span>
                <span class="text-secondary-900">{{ formatCurrency(bestellung.MwStGesamt) }}</span>
              </div>
              <div class="border-t border-secondary-200 pt-2 mt-2">
                <div class="flex justify-between font-medium">
                  <span class="text-secondary-800">{{ $t('restaurant.orders.total', 'Gesamt') }}</span>
                  <span class="text-xl text-primary-600">{{ formatCurrency(bestellung.GesamtbetragBrutto) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Actions -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.status', 'Status') }}</h2>
            <div class="space-y-3">
              <Button
                v-if="bestellung.Status === 'Offen'"
                class="w-full"
                icon="i-mdi-chef-hat"
                :loading="updating"
                @click="updateStatus('In_Zubereitung')"
              >
                {{ $t('restaurant.orders.startPreparing', 'Zubereitung starten') }}
              </Button>
              <Button
                v-if="bestellung.Status === 'In_Zubereitung'"
                class="w-full"
                icon="i-mdi-food"
                :loading="updating"
                @click="updateStatus('Serviert')"
              >
                {{ $t('restaurant.orders.markServed', 'Als serviert markieren') }}
              </Button>
              <Button
                v-if="bestellung.Status === 'Serviert'"
                class="w-full"
                variant="success"
                icon="i-mdi-cash-register"
                :loading="updating"
                @click="updateStatus('Bezahlt')"
              >
                {{ $t('restaurant.orders.markPaid', 'Als bezahlt markieren') }}
              </Button>
              <Button
                v-if="bestellung.Status !== 'Bezahlt' && bestellung.Status !== 'Storniert'"
                variant="danger"
                class="w-full"
                icon="i-mdi-close-circle"
                :loading="updating"
                @click="showCancelModal = true"
              >
                {{ $t('restaurant.orders.cancel', 'Stornieren') }}
              </Button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <Button variant="secondary" icon="i-mdi-printer" @click="printOrder">
              {{ $t('restaurant.orders.print', 'Drucken') }}
            </Button>
            <Button variant="secondary" @click="navigateTo('/restaurant/bestellungen')">
              {{ $t('common.back', 'Zuruck zur Liste') }}
            </Button>
          </div>
        </div>
      </div>
    </template>

    <!-- Cancel Modal -->
    <Modal v-model="showCancelModal" :title="$t('restaurant.orders.cancelOrder', 'Bestellung stornieren')">
      <p class="text-secondary-700">
        {{ $t('restaurant.orders.cancelConfirm', 'Mochten Sie diese Bestellung wirklich stornieren?') }}
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showCancelModal = false">
            {{ $t('common.no', 'Nein') }}
          </Button>
          <Button variant="danger" :loading="updating" @click="updateStatus('Storniert'); showCancelModal = false">
            {{ $t('common.yes', 'Ja, stornieren') }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()
const route = useRoute()

const id = computed(() => parseInt(route.params.id as string))

const bestellung = ref<any>({})
const loading = ref(true)
const updating = ref(false)
const error = ref<string | null>(null)
const showCancelModal = ref(false)

const breadcrumbs = computed(() => [
  { label: t('menu.restaurant', 'Restaurant'), to: '/restaurant' },
  { label: t('restaurant.orders.title', 'Bestellungen'), to: '/restaurant/bestellungen' },
  { label: bestellung.value?.Bestellnummer || `#${id.value}` }
])

async function fetchBestellung() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/restaurant/bestellungen?id=${id.value}`)
    if (!response || response.error) {
      error.value = t('restaurant.orders.notFound', 'Bestellung nicht gefunden')
      return
    }
    bestellung.value = response
  } catch (err: any) {
    error.value = t('restaurant.orders.errorLoading', 'Fehler beim Laden der Bestellung')
    console.error('Fetch Bestellung Error:', err)
  } finally {
    loading.value = false
  }
}

async function updateStatus(newStatus: string) {
  try {
    updating.value = true
    await $fetch(`/api/restaurant/bestellungen?id=${id.value}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    bestellung.value.Status = newStatus
    toast.success(t('restaurant.orders.statusUpdated', 'Status aktualisiert'))
  } catch (err: any) {
    toast.error(t('restaurant.orders.errorUpdating', 'Fehler beim Aktualisieren'))
    console.error('Update Status Error:', err)
  } finally {
    updating.value = false
  }
}

function printOrder() {
  window.print()
}

function formatDateTime(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleString(locale.value === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Offen': 'Offen',
    'In_Zubereitung': 'In Zubereitung',
    'Serviert': 'Serviert',
    'Bezahlt': 'Bezahlt',
    'Storniert': 'Storniert'
  }
  return statusMap[status] || status
}

function formatPositionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Bestellt': 'Bestellt',
    'In_Zubereitung': 'In Zubereitung',
    'Fertig': 'Fertig',
    'Serviert': 'Serviert',
    'Storniert': 'Storniert'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Bezahlt': return `${baseClass} badge-success`
    case 'Offen': return `${baseClass} badge-warning`
    case 'In_Zubereitung': return `${baseClass} badge-info`
    case 'Serviert': return `${baseClass} badge-primary`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function getPositionStatusBadge(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Bestellt': return `${baseClass} badge-warning`
    case 'In_Zubereitung': return `${baseClass} badge-info`
    case 'Fertig': return `${baseClass} badge-primary`
    case 'Serviert': return `${baseClass} badge-success`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchBestellung()
})
</script>
