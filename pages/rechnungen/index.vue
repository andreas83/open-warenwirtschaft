<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('rechnungen.listTitle', 'Rechnungen') }}</h1>
      <div class="flex gap-2">
        <Button variant="secondary" icon="i-mdi-chart-bar" @click="navigateTo('/rechnungen/dashboard')">
          {{ $t('rechnungen.dashboard', 'Dashboard') }}
        </Button>
        <Button icon="i-mdi-plus" @click="navigateTo('/rechnungen/create')">
          {{ $t('rechnungen.newInvoice', 'Neue Rechnung') }}
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select
          v-model="statusFilter"
          class="input max-w-xs"
          @change="fetchRechnungen"
        >
          <option value="">{{ $t('rechnungen.allStatuses', 'Alle Status') }}</option>
          <option value="Offen">{{ $t('rechnungen.status.open', 'Offen') }}</option>
          <option value="Teilbezahlt">{{ $t('rechnungen.status.partiallyPaid', 'Teilbezahlt') }}</option>
          <option value="Bezahlt">{{ $t('rechnungen.status.paid', 'Bezahlt') }}</option>
          <option value="Überfällig">{{ $t('rechnungen.status.overdue', 'Überfällig') }}</option>
          <option value="Storniert">{{ $t('rechnungen.status.cancelled', 'Storniert') }}</option>
        </select>

        <AsyncAutocomplete
          v-model="selectedKunde"
          :items="kunden"
          :loading="kundenLoading"
          :display-fn="getKundeDisplayName"
          item-key="KundenID"
          :placeholder="$t('rechnungen.searchCustomer', 'Kunde suchen...')"
          class="max-w-xs"
          @search="handleKundeSearch"
        />
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="rechnungen"
        :loading="loading"
        :loading-text="$t('rechnungen.loadingInvoices', 'Lade Rechnungen...')"
        :empty-text="$t('rechnungen.noInvoicesFound', 'Keine Rechnungen gefunden')"
        row-key="RechnungsID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="pageSize"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Rechnungsnummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Rechnungsnummer }}</div>
          <div class="text-sm text-secondary-500">{{ formatDate(row.Rechnungsdatum) }}</div>
        </template>

        <template #cell-Kunde="{ row }">
          <div class="text-sm">{{ getKundenName(row) }}</div>
        </template>

        <template #cell-GesamtbetragBrutto="{ row }">
          <div class="font-medium text-secondary-900">
            {{ formatCurrency(row.GesamtbetragBrutto) }}
          </div>
        </template>

        <template #cell-Zahlungsstatus="{ value }">
          <span :class="getStatusBadgeClass(value)">
            {{ value }}
          </span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-eye"
              @click="navigateTo(`/rechnungen/details/${row.RechnungsID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/rechnungen/edit/${row.RechnungsID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.RechnungsID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Löschen bestätigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('rechnungen.confirmDeleteInvoice', 'Möchten Sie diese Rechnung wirklich löschen?') }}
      </p>
      <p class="font-medium mt-2">{{ invoiceToDelete?.Rechnungsnummer }}</p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showDeleteModal = false">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button variant="danger" :loading="deletingId !== null" @click="handleDelete">
            {{ $t('common.delete', 'Löschen') }}
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
  { label: t('menu.invoices', 'Rechnungen'), to: '/rechnungen' }
])

const columns = [
  { key: 'Rechnungsnummer', label: t('rechnungen.invoiceNumber', 'Rechnungsnr.'), sortable: true },
  { key: 'Kunde', label: t('rechnungen.customer', 'Kunde'), sortable: false },
  { key: 'GesamtbetragBrutto', label: t('rechnungen.totalAmount', 'Betrag'), sortable: true, align: 'right' as const },
  { key: 'Zahlungsstatus', label: t('rechnungen.statusLabel', 'Status'), sortable: true }
]

const rechnungen = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const pageSize = ref(10)
const deletingId = ref(null)
const showDeleteModal = ref(false)
const invoiceToDelete = ref(null)

// Customer filter
const kunden = ref([])
const kundenLoading = ref(false)
const selectedKunde = ref(null)

async function fetchRechnungen() {
  try {
    loading.value = true
    let url = '/api/rechnungen'
    const params = new URLSearchParams()

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (selectedKunde.value) params.append('kunde', selectedKunde.value.KundenID)

    if (params.toString()) url += `?${params.toString()}`

    const response = await $fetch(url)
    rechnungen.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('rechnungen.errorLoadingInvoices', 'Fehler beim Laden der Rechnungen'))
    console.error('Fetch Rechnungen Error:', err)
    rechnungen.value = []
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
  fetchRechnungen()
})

function handleSearch(query: string) {
  searchQuery.value = query
  fetchRechnungen()
}

function getKundeDisplayName(kunde: any): string {
  if (!kunde) return ''
  if (kunde.Firmenname) return kunde.Firmenname
  return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || kunde.Name || 'Unbekannt'
}

function getKundenName(rechnung: any): string {
  if (rechnung.Kunden) {
    return getKundeDisplayName(rechnung.Kunden)
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

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Bezahlt': return `${baseClass} badge-success`
    case 'Offen': return `${baseClass} badge-warning`
    case 'Überfällig': return `${baseClass} badge-danger`
    case 'Teilbezahlt': return `${baseClass} badge-info`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function confirmDelete(invoice: any) {
  invoiceToDelete.value = invoice
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!invoiceToDelete.value) return

  const id = invoiceToDelete.value.RechnungsID
  try {
    deletingId.value = id
    await $fetch(`/api/rechnungen?id=${id}`, { method: 'DELETE' })
    rechnungen.value = rechnungen.value.filter(r => r.RechnungsID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich gelöscht'))
  } catch (err) {
    toast.error(t('rechnungen.errorDeletingInvoice', 'Fehler beim Löschen der Rechnung'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    invoiceToDelete.value = null
  }
}

onMounted(() => {
  fetchRechnungen()
})
</script>
