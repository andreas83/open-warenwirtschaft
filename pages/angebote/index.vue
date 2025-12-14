<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('angebote.listTitle', 'Angebote') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/angebote/create')">
        {{ $t('angebote.newQuote', 'Neues Angebot') }}
      </Button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="statusFilter" class="input max-w-xs" @change="fetchAngebote">
          <option value="">{{ $t('angebote.allStatuses', 'Alle Status') }}</option>
          <option value="Entwurf">{{ $t('angebote.status.draft', 'Entwurf') }}</option>
          <option value="Versendet">{{ $t('angebote.status.sent', 'Versendet') }}</option>
          <option value="Angenommen">{{ $t('angebote.status.accepted', 'Angenommen') }}</option>
          <option value="Abgelehnt">{{ $t('angebote.status.rejected', 'Abgelehnt') }}</option>
          <option value="Abgelaufen">{{ $t('angebote.status.expired', 'Abgelaufen') }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="angebote"
        :loading="loading"
        :loading-text="$t('angebote.loading', 'Lade Angebote...')"
        :empty-text="$t('angebote.noQuotes', 'Keine Angebote gefunden')"
        row-key="AngebotID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="10"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Angebotsnummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Angebotsnummer }}</div>
          <div class="text-sm text-secondary-500">{{ row.Angebotstitel }}</div>
        </template>

        <template #cell-Kunde="{ row }">
          <div class="text-sm">{{ getKundenName(row) }}</div>
        </template>

        <template #cell-Datum="{ row }">
          <div class="text-sm">
            <div>{{ formatDate(row.Angebotsdatum) }}</div>
            <div class="text-secondary-500">{{ $t('angebote.validUntil', 'Gultig bis') }}: {{ formatDate(row.Gueltigkeitsdatum) }}</div>
          </div>
        </template>

        <template #cell-GesamtsummeBrutto="{ value }">
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
              @click="navigateTo(`/angebote/details/${row.AngebotID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/angebote/edit/${row.AngebotID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.AngebotID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Loschen bestatigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('angebote.confirmDelete', 'Mochten Sie dieses Angebot wirklich loschen?') }}
      </p>
      <p class="font-medium mt-2">{{ quoteToDelete?.Angebotsnummer }}</p>
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
  { label: t('menu.quotes', 'Angebote'), to: '/angebote' }
])

const columns = [
  { key: 'Angebotsnummer', label: t('angebote.quoteNumber', 'Angebotsnr.'), sortable: true },
  { key: 'Kunde', label: t('angebote.customer', 'Kunde'), sortable: false },
  { key: 'Datum', label: t('angebote.dates', 'Datum'), sortable: false },
  { key: 'GesamtsummeBrutto', label: t('angebote.total', 'Gesamt'), sortable: true, align: 'right' as const },
  { key: 'Status', label: t('angebote.status', 'Status'), sortable: true }
]

const angebote = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const deletingId = ref<number | null>(null)
const showDeleteModal = ref(false)
const quoteToDelete = ref<any>(null)

async function fetchAngebote() {
  try {
    loading.value = true
    let url = '/api/angebote'
    const params = new URLSearchParams()

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('status', statusFilter.value)

    if (params.toString()) url += `?${params.toString()}`

    const response = await $fetch(url)
    angebote.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('angebote.errorLoading', 'Fehler beim Laden der Angebote'))
    console.error('Fetch Angebote Error:', err)
    angebote.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  fetchAngebote()
}

function getKundenName(angebot: any): string {
  if (angebot.Kunden) {
    const kunde = angebot.Kunden
    if (kunde.Firmenname) return kunde.Firmenname
    return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || 'Unbekannt'
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
    'Entwurf': 'Entwurf',
    'Versendet': 'Versendet',
    'Angenommen': 'Angenommen',
    'Abgelehnt': 'Abgelehnt',
    'Abgelaufen': 'Abgelaufen'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Angenommen': return `${baseClass} badge-success`
    case 'Entwurf': return `${baseClass} badge-warning`
    case 'Versendet': return `${baseClass} badge-info`
    case 'Abgelehnt': return `${baseClass} badge-danger`
    case 'Abgelaufen': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function confirmDelete(quote: any) {
  quoteToDelete.value = quote
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!quoteToDelete.value) return

  const id = quoteToDelete.value.AngebotID
  try {
    deletingId.value = id
    await $fetch(`/api/angebote?id=${id}`, { method: 'DELETE' })
    angebote.value = angebote.value.filter(a => a.AngebotID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich geloscht'))
  } catch (err) {
    toast.error(t('angebote.errorDeleting', 'Fehler beim Loschen des Angebots'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    quoteToDelete.value = null
  }
}

onMounted(() => {
  fetchAngebote()
})
</script>
