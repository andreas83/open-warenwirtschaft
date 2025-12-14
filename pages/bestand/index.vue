<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('bestand.title', 'Lagerbestand') }}</h1>
      <div class="flex gap-2">
        <select v-model="selectedStandort" class="input max-w-xs" @change="fetchBestand">
          <option :value="null">{{ $t('bestand.allLocations', 'Alle Standorte') }}</option>
          <option v-for="s in standorte" :key="s.StandortID" :value="s.StandortID">
            {{ s.Name }}
          </option>
        </select>
        <Button icon="i-mdi-refresh" variant="secondary" :loading="loading" @click="fetchBestand">
          {{ $t('common.refresh', 'Aktualisieren') }}
        </Button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
            <span class="i-mdi-package-variant w-6 h-6 text-primary-600"></span>
          </div>
          <div>
            <p class="text-sm text-secondary-500">{{ $t('bestand.totalProducts', 'Produkte') }}</p>
            <p class="text-2xl font-bold text-secondary-900">{{ bestandData?.kpis?.totalProducts || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-success-100 flex items-center justify-center">
            <span class="i-mdi-currency-eur w-6 h-6 text-success-600"></span>
          </div>
          <div>
            <p class="text-sm text-secondary-500">{{ $t('bestand.inventoryValue', 'Lagerwert') }}</p>
            <p class="text-2xl font-bold text-secondary-900">{{ formatCurrency(bestandData?.kpis?.totalInventoryValue || 0) }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-warning-100 flex items-center justify-center">
            <span class="i-mdi-alert w-6 h-6 text-warning-600"></span>
          </div>
          <div>
            <p class="text-sm text-secondary-500">{{ $t('bestand.lowStock', 'Niedrig') }}</p>
            <p class="text-2xl font-bold text-warning-600">{{ bestandData?.kpis?.lowStockCount || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-danger-100 flex items-center justify-center">
            <span class="i-mdi-clock-alert w-6 h-6 text-danger-600"></span>
          </div>
          <div>
            <p class="text-sm text-secondary-500">{{ $t('bestand.expiring', 'Ablaufend') }}</p>
            <p class="text-2xl font-bold text-danger-600">{{ bestandData?.kpis?.expiringCount || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Stock by Location -->
      <div class="card">
        <div class="p-4 border-b border-secondary-200">
          <h2 class="text-lg font-semibold text-secondary-800">{{ $t('bestand.stockByLocation', 'Bestand nach Standort') }}</h2>
        </div>
        <div class="p-4">
          <div v-if="loading" class="text-center py-8 text-secondary-500">
            <span class="i-mdi-loading animate-spin w-6 h-6 mx-auto"></span>
          </div>
          <div v-else-if="!bestandData?.stockByLocation?.length" class="text-center py-8 text-secondary-500">
            {{ $t('bestand.noData', 'Keine Daten vorhanden') }}
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="loc in bestandData.stockByLocation"
              :key="loc.location"
              class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-secondary-900">{{ loc.location }}</p>
                <p class="text-sm text-secondary-500">{{ loc.products }} {{ $t('bestand.products', 'Produkte') }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-secondary-900">{{ loc.totalQuantity.toLocaleString() }}</p>
                <p class="text-sm text-success-600">{{ formatCurrency(loc.value) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Distribution -->
      <div class="card">
        <div class="p-4 border-b border-secondary-200">
          <h2 class="text-lg font-semibold text-secondary-800">{{ $t('bestand.statusDistribution', 'Status-Verteilung') }}</h2>
        </div>
        <div class="p-4">
          <div v-if="loading" class="text-center py-8 text-secondary-500">
            <span class="i-mdi-loading animate-spin w-6 h-6 mx-auto"></span>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-success-50 rounded-lg">
              <span class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-success-500"></span>
                {{ $t('bestand.status.available', 'Verfugbar') }}
              </span>
              <span class="font-medium">{{ bestandData?.statusDistribution?.Verfugbar || 0 }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-info-50 rounded-lg">
              <span class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-info-500"></span>
                {{ $t('bestand.status.reserved', 'Reserviert') }}
              </span>
              <span class="font-medium">{{ bestandData?.statusDistribution?.Reserviert || 0 }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <span class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-warning-500"></span>
                {{ $t('bestand.status.damaged', 'Beschadigt') }}
              </span>
              <span class="font-medium">{{ bestandData?.statusDistribution?.Beschadigt || 0 }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-danger-50 rounded-lg">
              <span class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-danger-500"></span>
                {{ $t('bestand.status.blocked', 'Gesperrt') }}
              </span>
              <span class="font-medium">{{ bestandData?.statusDistribution?.Gesperrt || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Low Stock Products -->
    <div v-if="bestandData?.lowStockProducts?.length" class="card mb-6">
      <div class="p-4 border-b border-secondary-200 flex items-center gap-2">
        <span class="i-mdi-alert text-warning-500 w-5 h-5"></span>
        <h2 class="text-lg font-semibold text-secondary-800">{{ $t('bestand.lowStockProducts', 'Produkte mit niedrigem Bestand') }}</h2>
      </div>
      <DataTable
        :columns="lowStockColumns"
        :data="bestandData.lowStockProducts"
        :loading="loading"
        row-key="produktId"
        :page-size="5"
        paginated
        striped
        hoverable
      >
        <template #cell-produktName="{ value }">
          <span class="font-medium text-secondary-900">{{ value }}</span>
        </template>
        <template #cell-menge="{ row }">
          <span class="text-danger-600 font-medium">{{ row.menge }}</span>
          <span class="text-secondary-400 mx-1">/</span>
          <span class="text-secondary-500">{{ row.meldebestand }}</span>
        </template>
      </DataTable>
    </div>

    <!-- Expiring Products -->
    <div v-if="bestandData?.expiringProducts?.length" class="card mb-6">
      <div class="p-4 border-b border-secondary-200 flex items-center gap-2">
        <span class="i-mdi-clock-alert text-danger-500 w-5 h-5"></span>
        <h2 class="text-lg font-semibold text-secondary-800">{{ $t('bestand.expiringProducts', 'Ablaufende Produkte (90 Tage)') }}</h2>
      </div>
      <DataTable
        :columns="expiringColumns"
        :data="bestandData.expiringProducts"
        :loading="loading"
        row-key="produktId"
        :page-size="5"
        paginated
        striped
        hoverable
      >
        <template #cell-produktName="{ value }">
          <span class="font-medium text-secondary-900">{{ value }}</span>
        </template>
        <template #cell-ablaufdatum="{ value }">
          <span :class="getDaysUntilExpiry(value) <= 30 ? 'text-danger-600 font-medium' : 'text-warning-600'">
            {{ formatDate(value) }}
          </span>
        </template>
      </DataTable>
    </div>

    <!-- Recent Movements -->
    <div class="card">
      <div class="p-4 border-b border-secondary-200 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-secondary-800">{{ $t('bestand.recentMovements', 'Letzte Lagerbewegungen') }}</h2>
        <Button variant="ghost" size="sm" @click="navigateTo('/lagerbewegungen')">
          {{ $t('common.viewAll', 'Alle anzeigen') }}
        </Button>
      </div>
      <DataTable
        :columns="movementColumns"
        :data="bestandData?.recentMovements || []"
        :loading="loading"
        row-key="id"
        :page-size="10"
        striped
        hoverable
      >
        <template #cell-datum="{ value }">
          <span class="text-secondary-600">{{ formatDateTime(value) }}</span>
        </template>
        <template #cell-typ="{ value }">
          <span :class="getMovementTypeBadge(value)">{{ value }}</span>
        </template>
        <template #cell-menge="{ value, row }">
          <span :class="row.typ === 'Eingang' || row.typ === 'Zugang' ? 'text-success-600' : 'text-danger-600'">
            {{ row.typ === 'Eingang' || row.typ === 'Zugang' ? '+' : '-' }}{{ value }}
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.inventory', 'Lagerbestand'), to: '/bestand' }
])

const lowStockColumns = [
  { key: 'produktName', label: t('bestand.product', 'Produkt'), sortable: true },
  { key: 'standort', label: t('bestand.location', 'Standort'), sortable: true },
  { key: 'menge', label: t('bestand.quantity', 'Menge / Meldebestand'), sortable: true, align: 'right' as const }
]

const expiringColumns = [
  { key: 'produktName', label: t('bestand.product', 'Produkt'), sortable: true },
  { key: 'chargennummer', label: t('bestand.batch', 'Charge'), sortable: false },
  { key: 'standort', label: t('bestand.location', 'Standort'), sortable: true },
  { key: 'menge', label: t('bestand.quantity', 'Menge'), sortable: true, align: 'right' as const },
  { key: 'ablaufdatum', label: t('bestand.expiryDate', 'Ablaufdatum'), sortable: true }
]

const movementColumns = [
  { key: 'datum', label: t('bestand.date', 'Datum'), sortable: true },
  { key: 'typ', label: t('bestand.type', 'Typ'), sortable: true },
  { key: 'produkt', label: t('bestand.product', 'Produkt'), sortable: true },
  { key: 'menge', label: t('bestand.quantity', 'Menge'), sortable: true, align: 'right' as const },
  { key: 'benutzer', label: t('bestand.user', 'Benutzer'), sortable: false }
]

const bestandData = ref<any>(null)
const standorte = ref<any[]>([])
const selectedStandort = ref<number | null>(null)
const loading = ref(true)

async function fetchStandorte() {
  try {
    const response = await $fetch('/api/standorte')
    standorte.value = Array.isArray(response) ? response : []
  } catch (err) {
    console.error('Fetch Standorte Error:', err)
    standorte.value = []
  }
}

async function fetchBestand() {
  try {
    loading.value = true
    let url = '/api/berichte/lagerbestand'
    if (selectedStandort.value) {
      url += `?standortId=${selectedStandort.value}`
    }
    const response = await $fetch(url)
    bestandData.value = response
  } catch (err) {
    toast.error(t('bestand.errorLoading', 'Fehler beim Laden der Bestandsdaten'))
    console.error('Fetch Bestand Error:', err)
    bestandData.value = null
  } finally {
    loading.value = false
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
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

function getDaysUntilExpiry(date: string): number {
  if (!date) return 999
  const expiry = new Date(date)
  const now = new Date()
  const diff = expiry.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function getMovementTypeBadge(type: string): string {
  const baseClass = 'badge'
  switch (type) {
    case 'Eingang':
    case 'Zugang':
      return `${baseClass} badge-success`
    case 'Ausgang':
    case 'Abgang':
      return `${baseClass} badge-danger`
    case 'Umbuchung':
      return `${baseClass} badge-info`
    case 'Inventur':
      return `${baseClass} badge-warning`
    default:
      return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(async () => {
  await Promise.all([fetchStandorte(), fetchBestand()])
})
</script>
