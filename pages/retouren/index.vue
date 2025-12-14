<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('retouren.listTitle', 'Retouren') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/retouren/create')">
        {{ $t('retouren.newReturn', 'Neue Retoure') }}
      </Button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="statusFilter" class="input max-w-xs" @change="fetchRetouren">
          <option value="">{{ $t('retouren.allStatuses', 'Alle Status') }}</option>
          <option value="Offen">{{ $t('retouren.status.open', 'Offen') }}</option>
          <option value="In_Bearbeitung">{{ $t('retouren.status.processing', 'In Bearbeitung') }}</option>
          <option value="Abgeschlossen">{{ $t('retouren.status.completed', 'Abgeschlossen') }}</option>
          <option value="Storniert">{{ $t('retouren.status.cancelled', 'Storniert') }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="retouren"
        :loading="loading"
        :loading-text="$t('retouren.loading', 'Lade Retouren...')"
        :empty-text="$t('retouren.noReturns', 'Keine Retouren gefunden')"
        row-key="RetourenID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="10"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Retourennummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Retourennummer }}</div>
          <div class="text-sm text-secondary-500">{{ formatDate(row.Retourendatum) }}</div>
        </template>

        <template #cell-Kunde="{ row }">
          <div class="text-sm">{{ getKundenName(row) }}</div>
        </template>

        <template #cell-Bestellung="{ row }">
          <NuxtLink
            v-if="row.BestellID"
            :to="`/bestellungen/details/${row.BestellID}`"
            class="text-sm text-primary-600 hover:underline"
          >
            {{ row.Bestellungen?.Bestellnummer || '-' }}
          </NuxtLink>
          <span v-else class="text-sm text-secondary-400">-</span>
        </template>

        <template #cell-Positionen="{ row }">
          <span class="badge badge-info">
            {{ row._count?.Retourenpositionen || 0 }} {{ $t('retouren.items', 'Artikel') }}
          </span>
        </template>

        <template #cell-GesamtbetragGutschrift="{ value }">
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
              @click="navigateTo(`/retouren/details/${row.RetourenID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.RetourenID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Loschen bestatigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('retouren.confirmDelete', 'Mochten Sie diese Retoure wirklich loschen?') }}
      </p>
      <p class="font-medium mt-2">{{ returnToDelete?.Retourennummer }}</p>
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
  { label: t('menu.returns', 'Retouren'), to: '/retouren' }
])

const columns = [
  { key: 'Retourennummer', label: t('retouren.returnNumber', 'Retourennr.'), sortable: true },
  { key: 'Kunde', label: t('retouren.customer', 'Kunde'), sortable: false },
  { key: 'Bestellung', label: t('retouren.order', 'Bestellung'), sortable: false },
  { key: 'Positionen', label: t('retouren.positions', 'Positionen'), sortable: false, align: 'center' as const },
  { key: 'GesamtbetragGutschrift', label: t('retouren.creditAmount', 'Gutschrift'), sortable: true, align: 'right' as const },
  { key: 'Status', label: t('retouren.status', 'Status'), sortable: true }
]

const retouren = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')
const deletingId = ref<number | null>(null)
const showDeleteModal = ref(false)
const returnToDelete = ref<any>(null)

async function fetchRetouren() {
  try {
    loading.value = true
    let url = '/api/retouren'
    const params = new URLSearchParams()

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (statusFilter.value) params.append('status', statusFilter.value)

    if (params.toString()) url += `?${params.toString()}`

    const response = await $fetch(url)
    retouren.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('retouren.errorLoading', 'Fehler beim Laden der Retouren'))
    console.error('Fetch Retouren Error:', err)
    retouren.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  fetchRetouren()
}

function getKundenName(retoure: any): string {
  if (retoure.Kunden) {
    const kunde = retoure.Kunden
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
    'Offen': 'Offen',
    'In_Bearbeitung': 'In Bearbeitung',
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
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function confirmDelete(retoure: any) {
  returnToDelete.value = retoure
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!returnToDelete.value) return

  const id = returnToDelete.value.RetourenID
  try {
    deletingId.value = id
    await $fetch(`/api/retouren?id=${id}`, { method: 'DELETE' })
    retouren.value = retouren.value.filter(r => r.RetourenID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich geloscht'))
  } catch (err) {
    toast.error(t('retouren.errorDeleting', 'Fehler beim Loschen der Retoure'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    returnToDelete.value = null
  }
}

onMounted(() => {
  fetchRetouren()
})
</script>
