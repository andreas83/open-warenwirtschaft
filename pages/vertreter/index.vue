<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('vertreter.listTitle', 'Vertreter') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/vertreter/create')">
        {{ $t('vertreter.newRep', 'Neuer Vertreter') }}
      </Button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="statusFilter" class="input max-w-xs" @change="fetchVertreter">
          <option value="">{{ $t('vertreter.allStatuses', 'Alle Status') }}</option>
          <option value="Aktiv">{{ $t('vertreter.status.active', 'Aktiv') }}</option>
          <option value="Inaktiv">{{ $t('vertreter.status.inactive', 'Inaktiv') }}</option>
          <option value="Gekuendigt">{{ $t('vertreter.status.terminated', 'Gekundigt') }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="vertreterList"
        :loading="loading"
        :loading-text="$t('vertreter.loading', 'Lade Vertreter...')"
        :empty-text="$t('vertreter.noReps', 'Keine Vertreter gefunden')"
        row-key="VertreterID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="15"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Name="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-medium">
              {{ row.Vorname?.charAt(0) }}{{ row.Nachname?.charAt(0) }}
            </div>
            <div>
              <div class="font-medium text-secondary-900">{{ row.Vorname }} {{ row.Nachname }}</div>
              <div class="text-sm text-secondary-500">{{ row.Vertreternummer }}</div>
            </div>
          </div>
        </template>

        <template #cell-Kontakt="{ row }">
          <div class="text-sm">
            <div class="text-secondary-900">{{ row.Email }}</div>
            <div v-if="row.Telefon" class="text-secondary-500">{{ row.Telefon }}</div>
          </div>
        </template>

        <template #cell-Gebiet="{ value }">
          <span v-if="value" class="text-secondary-700">{{ value }}</span>
          <span v-else class="text-secondary-400">-</span>
        </template>

        <template #cell-Provisionssatz="{ value }">
          <span v-if="value" class="font-medium text-secondary-900">{{ Number(value).toFixed(2) }}%</span>
          <span v-else class="text-secondary-400">-</span>
        </template>

        <template #cell-Kunden="{ row }">
          <span class="badge badge-primary">
            {{ row.KundenVertreter?.length || 0 }} {{ $t('vertreter.customers', 'Kunden') }}
          </span>
        </template>

        <template #cell-OffeneProvisionen="{ row }">
          <span v-if="row.Provisionen?.length" class="badge badge-warning">
            {{ row.Provisionen.length }} {{ $t('vertreter.pending', 'offen') }}
          </span>
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
              @click="navigateTo(`/vertreter/edit/${row.VertreterID}`)"
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
    <Modal v-model="showDeleteModal" :title="$t('vertreter.deleteRep', 'Vertreter loschen')">
      <p class="text-secondary-700">
        {{ $t('vertreter.deleteConfirm', 'Mochten Sie den Vertreter "{name}" wirklich loschen?', { name: repToDelete?.Vorname + ' ' + repToDelete?.Nachname }) }}
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showDeleteModal = false">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button variant="danger" :loading="deleting" @click="deleteRep">
            {{ $t('common.delete', 'Loschen') }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.representatives', 'Vertreter'), to: '/vertreter' }
])

const columns = [
  { key: 'Name', label: t('vertreter.name', 'Name'), sortable: true },
  { key: 'Kontakt', label: t('vertreter.contact', 'Kontakt'), sortable: false },
  { key: 'Gebiet', label: t('vertreter.region', 'Gebiet'), sortable: true },
  { key: 'Provisionssatz', label: t('vertreter.commissionRate', 'Provision'), sortable: true, align: 'right' as const },
  { key: 'Kunden', label: t('vertreter.customers', 'Kunden'), sortable: false, align: 'center' as const },
  { key: 'OffeneProvisionen', label: t('vertreter.pendingCommissions', 'Offen'), sortable: false, align: 'center' as const },
  { key: 'Status', label: t('vertreter.status', 'Status'), sortable: true }
]

const vertreterList = ref<any[]>([])
const loading = ref(true)
const statusFilter = ref('')
const showDeleteModal = ref(false)
const repToDelete = ref<any>(null)
const deleting = ref(false)

async function fetchVertreter() {
  try {
    loading.value = true
    let url = '/api/vertreter'
    if (statusFilter.value) {
      url += `?status=${statusFilter.value}`
    }
    const response = await $fetch(url)
    vertreterList.value = response?.representatives || []
  } catch (err) {
    toast.error(t('vertreter.errorLoading', 'Fehler beim Laden der Vertreter'))
    console.error('Fetch Vertreter Error:', err)
    vertreterList.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  // Search is handled client-side by DataTable
}

function confirmDelete(rep: any) {
  repToDelete.value = rep
  showDeleteModal.value = true
}

async function deleteRep() {
  if (!repToDelete.value) return

  try {
    deleting.value = true
    const response = await $fetch(`/api/vertreter?id=${repToDelete.value.VertreterID}`, {
      method: 'DELETE'
    })
    if (response?.status === 400) {
      toast.error(response.error || t('vertreter.errorDeleting', 'Fehler beim Loschen'))
      return
    }
    toast.success(t('vertreter.deleteSuccess', 'Vertreter erfolgreich geloscht'))
    showDeleteModal.value = false
    repToDelete.value = null
    fetchVertreter()
  } catch (err: any) {
    toast.error(t('vertreter.errorDeleting', 'Fehler beim Loschen des Vertreters'))
    console.error('Delete Rep Error:', err)
  } finally {
    deleting.value = false
  }
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Aktiv': 'Aktiv',
    'Inaktiv': 'Inaktiv',
    'Gekuendigt': 'Gekundigt'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Aktiv': return `${baseClass} badge-success`
    case 'Inaktiv': return `${baseClass} badge-warning`
    case 'Gekuendigt': return `${baseClass} badge-danger`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchVertreter()
})
</script>
