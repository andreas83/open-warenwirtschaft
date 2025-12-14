<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('restaurant.orders.listTitle', 'Bestellungen') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/restaurant/bestellungen/create')">
        {{ $t('restaurant.orders.newOrder', 'Neue Bestellung') }}
      </Button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="statusFilter" class="input max-w-xs" @change="fetchBestellungen">
          <option value="">{{ $t('restaurant.orders.allStatuses', 'Alle Status') }}</option>
          <option value="Offen">{{ $t('restaurant.orders.status.open', 'Offen') }}</option>
          <option value="In_Zubereitung">{{ $t('restaurant.orders.status.preparing', 'In Zubereitung') }}</option>
          <option value="Serviert">{{ $t('restaurant.orders.status.served', 'Serviert') }}</option>
          <option value="Bezahlt">{{ $t('restaurant.orders.status.paid', 'Bezahlt') }}</option>
          <option value="Storniert">{{ $t('restaurant.orders.status.cancelled', 'Storniert') }}</option>
        </select>

        <select v-model="tischFilter" class="input max-w-xs" @change="fetchBestellungen">
          <option value="">{{ $t('restaurant.orders.allTables', 'Alle Tische') }}</option>
          <option v-for="tisch in tische" :key="tisch.TischID" :value="tisch.TischID">
            {{ tisch.Tischname || `Tisch ${tisch.Tischnummer}` }}
          </option>
        </select>

        <input
          v-model="datumFilter"
          type="date"
          class="input max-w-xs"
          @change="fetchBestellungen"
        />
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="bestellungen"
        :loading="loading"
        :loading-text="$t('restaurant.orders.loading', 'Lade Bestellungen...')"
        :empty-text="$t('restaurant.orders.noOrders', 'Keine Bestellungen gefunden')"
        row-key="RestaurantBestellID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="15"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Bestellnummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Bestellnummer || `#${row.RestaurantBestellID}` }}</div>
          <div class="text-sm text-secondary-500">{{ formatDateTime(row.Bestelldatum) }}</div>
        </template>

        <template #cell-Tisch="{ row }">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-medium text-sm">
              {{ row.RestaurantTische?.Tischnummer }}
            </span>
            <div class="text-sm">
              <div class="text-secondary-900">{{ row.RestaurantTische?.Tischname || `Tisch ${row.RestaurantTische?.Tischnummer}` }}</div>
              <div class="text-secondary-500">{{ row.RestaurantTische?.Tischbereiche?.Name || '' }}</div>
            </div>
          </div>
        </template>

        <template #cell-Personen="{ row }">
          <span class="text-secondary-700">{{ row.PersonenAnzahl || 1 }} {{ $t('restaurant.orders.guests', 'Gaste') }}</span>
        </template>

        <template #cell-Positionen="{ row }">
          <span class="badge badge-primary">
            {{ row._count?.RestaurantBestellpositionen || 0 }} {{ $t('restaurant.orders.items', 'Artikel') }}
          </span>
        </template>

        <template #cell-GesamtbetragBrutto="{ value }">
          <span class="font-medium text-secondary-900">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-Status="{ value }">
          <span :class="getStatusBadgeClass(value)">{{ formatStatus(value) }}</span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-eye"
              @click="navigateTo(`/restaurant/bestellungen/details/${row.RestaurantBestellID}`)"
            />
            <Button
              v-if="row.Status === 'Offen' || row.Status === 'In_Zubereitung'"
              variant="ghost"
              size="sm"
              icon="i-mdi-check"
              class="text-success-600 hover:bg-success-50"
              @click="updateStatus(row, getNextStatus(row.Status))"
            />
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.restaurant', 'Restaurant'), to: '/restaurant' },
  { label: t('restaurant.orders.title', 'Bestellungen'), to: '/restaurant/bestellungen' }
])

const columns = [
  { key: 'Bestellnummer', label: t('restaurant.orders.orderNumber', 'Bestellnr.'), sortable: true },
  { key: 'Tisch', label: t('restaurant.orders.table', 'Tisch'), sortable: false },
  { key: 'Personen', label: t('restaurant.orders.guests', 'Gaste'), sortable: false },
  { key: 'Positionen', label: t('restaurant.orders.positions', 'Positionen'), sortable: false, align: 'center' as const },
  { key: 'GesamtbetragBrutto', label: t('restaurant.orders.total', 'Gesamt'), sortable: true, align: 'right' as const },
  { key: 'Status', label: t('restaurant.orders.status', 'Status'), sortable: true }
]

const bestellungen = ref<any[]>([])
const tische = ref<any[]>([])
const loading = ref(true)
const statusFilter = ref('')
const tischFilter = ref('')
const datumFilter = ref('')

async function fetchBestellungen() {
  try {
    loading.value = true
    let url = '/api/restaurant/bestellungen'
    const params = new URLSearchParams()

    if (statusFilter.value) params.append('status', statusFilter.value)
    if (tischFilter.value) params.append('tischId', tischFilter.value)
    if (datumFilter.value) params.append('datum', datumFilter.value)

    if (params.toString()) url += `?${params.toString()}`

    const response = await $fetch(url)
    bestellungen.value = response?.orders || []
  } catch (err) {
    toast.error(t('restaurant.orders.errorLoading', 'Fehler beim Laden der Bestellungen'))
    console.error('Fetch Bestellungen Error:', err)
    bestellungen.value = []
  } finally {
    loading.value = false
  }
}

async function fetchTische() {
  try {
    const response = await $fetch('/api/restaurant/tische')
    tische.value = Array.isArray(response) ? response : response?.tables || []
  } catch (err) {
    console.error('Fetch Tische Error:', err)
  }
}

function handleSearch(query: string) {
  // Search is handled client-side by DataTable
}

async function updateStatus(order: any, newStatus: string) {
  try {
    await $fetch(`/api/restaurant/bestellungen?id=${order.RestaurantBestellID}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    toast.success(t('restaurant.orders.statusUpdated', 'Status aktualisiert'))
    fetchBestellungen()
  } catch (err) {
    toast.error(t('restaurant.orders.errorUpdating', 'Fehler beim Aktualisieren'))
    console.error('Update Status Error:', err)
  }
}

function getNextStatus(currentStatus: string): string {
  const statusFlow: Record<string, string> = {
    'Offen': 'In_Zubereitung',
    'In_Zubereitung': 'Serviert',
    'Serviert': 'Bezahlt'
  }
  return statusFlow[currentStatus] || currentStatus
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

onMounted(async () => {
  await Promise.all([fetchBestellungen(), fetchTische()])
})
</script>
