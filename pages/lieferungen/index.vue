<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('lieferungen.title', 'Lieferungen') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/lieferungen/create')">
        {{ $t('lieferungen.newDelivery', 'Neue Lieferung') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('lieferungen.total', 'Gesamt') }}</div>
        <div class="text-2xl font-bold text-secondary-900">{{ stats.total }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('lieferungen.planned', 'Geplant') }}</div>
        <div class="text-2xl font-bold text-info-600">{{ stats.planned }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('lieferungen.inProgress', 'Unterwegs') }}</div>
        <div class="text-2xl font-bold text-warning-600">{{ stats.inProgress }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('lieferungen.delivered', 'Geliefert') }}</div>
        <div class="text-2xl font-bold text-success-600">{{ stats.delivered }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="statusFilter" class="input max-w-xs" @change="fetchLieferungen">
          <option value="">{{ $t('lieferungen.allStatuses', 'Alle Status') }}</option>
          <option value="Geplant">{{ $t('lieferungen.status.planned', 'Geplant') }}</option>
          <option value="In_Auslieferung">{{ $t('lieferungen.status.inProgress', 'In Auslieferung') }}</option>
          <option value="Geliefert">{{ $t('lieferungen.status.delivered', 'Geliefert') }}</option>
          <option value="Fehlgeschlagen">{{ $t('lieferungen.status.failed', 'Fehlgeschlagen') }}</option>
          <option value="Storniert">{{ $t('lieferungen.status.cancelled', 'Storniert') }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="lieferungen"
        :loading="loading"
        :loading-text="$t('lieferungen.loading', 'Lade Lieferungen...')"
        :empty-text="$t('lieferungen.noDeliveries', 'Keine Lieferungen gefunden')"
        row-key="LieferungID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="15"
        striped
        hoverable
      >
        <template #cell-Liefernummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Liefernummer }}</div>
          <div class="text-sm text-secondary-500">{{ formatDate(row.Erstelldatum) }}</div>
        </template>

        <template #cell-Bestellung="{ row }">
          <div class="text-sm">
            <div class="font-medium text-secondary-900">{{ row.Bestellungen?.Bestellnummer }}</div>
            <div class="text-secondary-500">{{ row.Bestellungen?.Kunden?.Firmenname || row.Bestellungen?.Kunden?.Vorname + ' ' + row.Bestellungen?.Kunden?.Nachname }}</div>
          </div>
        </template>

        <template #cell-Lieferdatum="{ row }">
          <div class="text-sm">
            <div v-if="row.GeplantesLieferdatum" class="text-secondary-600">
              <span class="i-mdi-calendar-clock mr-1"></span>{{ formatDate(row.GeplantesLieferdatum) }}
            </div>
            <div v-if="row.Lieferdatum" class="text-success-600 font-medium">
              <span class="i-mdi-calendar-check mr-1"></span>{{ formatDate(row.Lieferdatum) }}
            </div>
            <span v-if="!row.GeplantesLieferdatum && !row.Lieferdatum" class="text-secondary-400">-</span>
          </div>
        </template>

        <template #cell-Tour="{ row }">
          <span v-if="row.Touren" class="badge badge-primary">
            {{ row.Touren.Tournummer }}
          </span>
          <span v-else class="text-secondary-400">-</span>
        </template>

        <template #cell-TrackingNummer="{ value }">
          <span v-if="value" class="font-mono text-sm text-secondary-700">{{ value }}</span>
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
              icon="i-mdi-eye"
              @click="navigateTo(`/lieferungen/details/${row.LieferungID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/lieferungen/edit/${row.LieferungID}`)"
            />
            <Button
              v-if="row.Status === 'Geplant'"
              variant="ghost"
              size="sm"
              icon="i-mdi-truck-delivery"
              class="text-success-600 hover:bg-success-50"
              @click="startDelivery(row)"
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
  { label: t('menu.deliveries', 'Lieferungen'), to: '/lieferungen' }
])

const columns = [
  { key: 'Liefernummer', label: t('lieferungen.deliveryNumber', 'Liefernr.'), sortable: true },
  { key: 'Bestellung', label: t('lieferungen.order', 'Bestellung'), sortable: false },
  { key: 'Lieferdatum', label: t('lieferungen.deliveryDate', 'Lieferdatum'), sortable: true },
  { key: 'Tour', label: t('lieferungen.tour', 'Tour'), sortable: false, align: 'center' as const },
  { key: 'TrackingNummer', label: t('lieferungen.tracking', 'Tracking'), sortable: false },
  { key: 'Status', label: t('lieferungen.status', 'Status'), sortable: true }
]

const lieferungen = ref<any[]>([])
const stats = ref({
  total: 0,
  planned: 0,
  inProgress: 0,
  delivered: 0
})
const loading = ref(true)
const statusFilter = ref('')

async function fetchLieferungen() {
  try {
    loading.value = true
    let url = '/api/lieferungen'
    if (statusFilter.value) {
      url += `?status=${statusFilter.value}`
    }
    const response = await $fetch(url)
    lieferungen.value = response?.deliveries || []
    if (response?.stats) {
      stats.value = response.stats
    }
  } catch (err) {
    toast.error(t('lieferungen.errorLoading', 'Fehler beim Laden der Lieferungen'))
    console.error('Fetch Lieferungen Error:', err)
    lieferungen.value = []
  } finally {
    loading.value = false
  }
}

async function startDelivery(delivery: any) {
  try {
    await $fetch(`/api/lieferungen?id=${delivery.LieferungID}`, {
      method: 'PUT',
      body: { status: 'In_Auslieferung' }
    })
    toast.success(t('lieferungen.deliveryStarted', 'Lieferung gestartet'))
    fetchLieferungen()
  } catch (err) {
    toast.error(t('lieferungen.errorUpdating', 'Fehler beim Aktualisieren'))
    console.error('Update Lieferung Error:', err)
  }
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Geplant': 'Geplant',
    'In_Auslieferung': 'In Auslieferung',
    'Geliefert': 'Geliefert',
    'Fehlgeschlagen': 'Fehlgeschlagen',
    'Storniert': 'Storniert'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Geplant': return `${baseClass} badge-info`
    case 'In_Auslieferung': return `${baseClass} badge-warning`
    case 'Geliefert': return `${baseClass} badge-success`
    case 'Fehlgeschlagen': return `${baseClass} badge-danger`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchLieferungen()
})
</script>
