<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('preisvertraege.listTitle', 'Preisvertrage') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/preisvertraege/create')">
        {{ $t('preisvertraege.newContract', 'Neuer Vertrag') }}
      </Button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="statusFilter" class="input max-w-xs" @change="fetchVertraege">
          <option value="">{{ $t('preisvertraege.allStatuses', 'Alle Status') }}</option>
          <option value="Aktiv">{{ $t('preisvertraege.status.active', 'Aktiv') }}</option>
          <option value="Inaktiv">{{ $t('preisvertraege.status.inactive', 'Inaktiv') }}</option>
          <option value="Abgelaufen">{{ $t('preisvertraege.status.expired', 'Abgelaufen') }}</option>
          <option value="Gekuendigt">{{ $t('preisvertraege.status.cancelled', 'Gekundigt') }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="vertraege"
        :loading="loading"
        :loading-text="$t('preisvertraege.loading', 'Lade Vertrage...')"
        :empty-text="$t('preisvertraege.noContracts', 'Keine Vertrage gefunden')"
        row-key="VertragsID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="15"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Vertragsnummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Vertragsnummer }}</div>
          <div class="text-sm text-secondary-500">{{ row.Vertragsbezeichnung }}</div>
        </template>

        <template #cell-Kunde="{ row }">
          <div class="text-sm">
            <div class="font-medium text-secondary-900">{{ row.Kunden?.Firmenname || row.Kunden?.Vorname + ' ' + row.Kunden?.Nachname }}</div>
            <div class="text-secondary-500">{{ row.Kunden?.Email || '' }}</div>
          </div>
        </template>

        <template #cell-Gueltigkeit="{ row }">
          <div class="text-sm text-secondary-700">
            <span>{{ formatDate(row.GueltigAb) }}</span>
            <span v-if="row.GueltigBis"> - {{ formatDate(row.GueltigBis) }}</span>
            <span v-else> - {{ $t('preisvertraege.unlimited', 'Unbefristet') }}</span>
          </div>
        </template>

        <template #cell-Positionen="{ row }">
          <span class="badge badge-primary">
            {{ row.Vertragspositionen?.length || 0 }} {{ $t('preisvertraege.positions', 'Positionen') }}
          </span>
        </template>

        <template #cell-Mindestabnahme="{ value }">
          <span v-if="value" class="text-secondary-700">{{ formatCurrency(value) }}</span>
          <span v-else class="text-secondary-400">-</span>
        </template>

        <template #cell-Status="{ value }">
          <span :class="getStatusBadgeClass(value)">{{ formatStatus(value) }}</span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/preisvertraege/edit/${row.VertragsID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('preisvertraege.deleteContract', 'Vertrag loschen')">
      <p class="text-secondary-700">
        {{ $t('preisvertraege.deleteConfirm', 'Mochten Sie den Vertrag "{name}" wirklich loschen?', { name: contractToDelete?.Vertragsnummer }) }}
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showDeleteModal = false">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button variant="danger" :loading="deleting" @click="deleteContract">
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
  { label: t('menu.priceContracts', 'Preisvertrage'), to: '/preisvertraege' }
])

const columns = [
  { key: 'Vertragsnummer', label: t('preisvertraege.contractNumber', 'Vertragsnr.'), sortable: true },
  { key: 'Kunde', label: t('preisvertraege.customer', 'Kunde'), sortable: false },
  { key: 'Gueltigkeit', label: t('preisvertraege.validity', 'Gultigkeit'), sortable: false },
  { key: 'Positionen', label: t('preisvertraege.positions', 'Positionen'), sortable: false, align: 'center' as const },
  { key: 'Mindestabnahme', label: t('preisvertraege.minimumOrder', 'Mindestabnahme'), sortable: true, align: 'right' as const },
  { key: 'Status', label: t('preisvertraege.status', 'Status'), sortable: true }
]

const vertraege = ref<any[]>([])
const loading = ref(true)
const statusFilter = ref('')
const showDeleteModal = ref(false)
const contractToDelete = ref<any>(null)
const deleting = ref(false)

async function fetchVertraege() {
  try {
    loading.value = true
    let url = '/api/preisvertraege'
    if (statusFilter.value) {
      url += `?status=${statusFilter.value}`
    }
    const response = await $fetch(url)
    vertraege.value = response?.contracts || []
  } catch (err) {
    toast.error(t('preisvertraege.errorLoading', 'Fehler beim Laden der Vertrage'))
    console.error('Fetch Vertraege Error:', err)
    vertraege.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  // Search is handled client-side by DataTable
}

function confirmDelete(contract: any) {
  contractToDelete.value = contract
  showDeleteModal.value = true
}

async function deleteContract() {
  if (!contractToDelete.value) return

  try {
    deleting.value = true
    await $fetch(`/api/preisvertraege?id=${contractToDelete.value.VertragsID}`, {
      method: 'DELETE'
    })
    toast.success(t('preisvertraege.deleteSuccess', 'Vertrag erfolgreich geloscht'))
    showDeleteModal.value = false
    contractToDelete.value = null
    fetchVertraege()
  } catch (err: any) {
    toast.error(t('preisvertraege.errorDeleting', 'Fehler beim Loschen des Vertrags'))
    console.error('Delete Contract Error:', err)
  } finally {
    deleting.value = false
  }
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
    'Aktiv': 'Aktiv',
    'Inaktiv': 'Inaktiv',
    'Abgelaufen': 'Abgelaufen',
    'Gekuendigt': 'Gekundigt'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Aktiv': return `${baseClass} badge-success`
    case 'Inaktiv': return `${baseClass} badge-warning`
    case 'Abgelaufen': return `${baseClass} bg-secondary-100 text-secondary-700`
    case 'Gekuendigt': return `${baseClass} badge-danger`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchVertraege()
})
</script>
