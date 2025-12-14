<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('bestellungen.listTitle', 'Bestellungen') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/bestellungen/create')">
        {{ $t('bestellungen.newOrder', 'Neue Bestellung') }}
      </Button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="statusFilter" class="input max-w-xs" @change="fetchBestellungen">
          <option value="">{{ $t('bestellungen.allStatuses', 'Alle Status') }}</option>
          <option value="Offen">{{ $t('bestellungen.status.open', 'Offen') }}</option>
          <option value="In_Bearbeitung">{{ $t('bestellungen.status.processing', 'In Bearbeitung') }}</option>
          <option value="Versendet">{{ $t('bestellungen.status.shipped', 'Versendet') }}</option>
          <option value="Abgeschlossen">{{ $t('bestellungen.status.completed', 'Abgeschlossen') }}</option>
          <option value="Storniert">{{ $t('bestellungen.status.cancelled', 'Storniert') }}</option>
        </select>

        <AsyncAutocomplete
          v-model="selectedKunde"
          :items="kunden"
          :loading="kundenLoading"
          :display-fn="getKundeDisplayName"
          item-key="KundenID"
          :placeholder="$t('bestellungen.searchCustomer', 'Kunde suchen...')"
          class="max-w-xs"
          @search="handleKundeSearch"
        />
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="bestellungen"
        :loading="loading"
        :loading-text="$t('bestellungen.loadingOrders', 'Lade Bestellungen...')"
        :empty-text="$t('bestellungen.noOrdersFound', 'Keine Bestellungen gefunden')"
        row-key="BestellID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="10"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Bestellnummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Bestellnummer }}</div>
          <div class="text-sm text-secondary-500">{{ formatDate(row.Bestelldatum) }}</div>
        </template>

        <template #cell-Kunde="{ row }">
          <div class="text-sm">{{ getKundenName(row) }}</div>
        </template>

        <template #cell-Positionen="{ row }">
          <span class="badge badge-primary">
            {{ row._count?.Bestellpositionen || 0 }} {{ $t('bestellungen.items', 'Artikel') }}
          </span>
        </template>

        <template #cell-GesamtsummeBrutto="{ value }">
          <div class="font-medium text-secondary-900">{{ formatCurrency(value) }}</div>
        </template>

        <template #cell-Bestellstatus="{ value }">
          <span :class="getStatusBadgeClass(value)">{{ formatStatus(value) }}</span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-eye"
              @click="navigateTo(`/bestellungen/details/${row.BestellID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/bestellungen/edit/${row.BestellID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.BestellID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Loschen bestatigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('bestellungen.confirmDelete', 'Mochten Sie diese Bestellung wirklich loschen?') }}
      </p>
      <p class="font-medium mt-2">{{ orderToDelete?.Bestellnummer }}</p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showDeleteModal = false">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button variant="danger" :loading="deletingId !== null" @click="handleDelete">
            {{ $t('common.delete', 'Loschen') }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.orders', 'Bestellungen'), to: '/bestellungen' }
])

const columns = [
  { key: 'Bestellnummer', label: t('bestellungen.orderNumber', 'Bestellnr.'), sortable: true },
  { key: 'Kunde', label: t('bestellungen.customer', 'Kunde'), sortable: false },
  { key: 'Positionen', label: t('bestellungen.positions', 'Positionen'), sortable: false, align: 'center' as const },
  { key: 'GesamtsummeBrutto', label: t('bestellungen.total', 'Gesamt'), sortable: true, align: 'right' as const },
  { key: 'Bestellstatus', label: t('bestellungen.status', 'Status'), sortable: true }
]

const bestellungen = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const deletingId = ref<number | null>(null)
const showDeleteModal = ref(false)
const orderToDelete = ref<any>(null)

// Customer filter
const kunden = ref<any[]>([])
const kundenLoading = ref(false)
const selectedKunde = ref<any>(null)

async function fetchBestellungen() {
  try {
    loading.value = true
    let url = '/api/bestellungen'
    const params = new URLSearchParams()

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (selectedKunde.value) params.append('kunde', selectedKunde.value.KundenID)

    if (params.toString()) url += `?${params.toString()}`

    const response = await $fetch(url)
    bestellungen.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('bestellungen.errorLoading', 'Fehler beim Laden der Bestellungen'))
    console.error('Fetch Bestellungen Error:', err)
    bestellungen.value = []
  } finally {
    loading.value = false
  }
}

async function handleKundeSearch(query: string) {
  if (!query) {
    kunden.value = []
    return
  }
  try {
    kundenLoading.value = true
    const response = await $fetch(`/api/kunden?limit=20&search=${encodeURIComponent(query)}`)
    kunden.value = Array.isArray(response) ? response : response?.data || []
  } catch (err) {
    console.error('Fetch Kunden Error:', err)
    kunden.value = []
  } finally {
    kundenLoading.value = false
  }
}

watch(selectedKunde, () => {
  fetchBestellungen()
})

function handleSearch(query: string) {
  searchQuery.value = query
  fetchBestellungen()
}

function getKundeDisplayName(kunde: any): string {
  if (!kunde) return ''
  if (kunde.Firmenname) return kunde.Firmenname
  return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || kunde.Name || 'Unbekannt'
}

function getKundenName(bestellung: any): string {
  if (bestellung.Kunden) {
    return getKundeDisplayName(bestellung.Kunden)
  }
  return 'Unbekannt'
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
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
    'In_Bearbeitung': 'In Bearbeitung',
    'Versendet': 'Versendet',
    'Abgeschlossen': 'Abgeschlossen',
    'Storniert': 'Storniert'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Abgeschlossen': return `${baseClass} badge-success`
    case 'Offen': return `${baseClass} badge-warning`
    case 'In_Bearbeitung': return `${baseClass} badge-info`
    case 'Versendet': return `${baseClass} badge-primary`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function confirmDelete(order: any) {
  orderToDelete.value = order
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!orderToDelete.value) return

  const id = orderToDelete.value.BestellID
  try {
    deletingId.value = id
    await $fetch(`/api/bestellungen?id=${id}`, { method: 'DELETE' })
    bestellungen.value = bestellungen.value.filter(b => b.BestellID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich geloscht'))
  } catch (err) {
    toast.error(t('bestellungen.errorDeleting', 'Fehler beim Loschen der Bestellung'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    orderToDelete.value = null
  }
}

onMounted(() => {
  fetchBestellungen()
})
</script>
