<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('zahlungen.listTitle', 'Zahlungen') }}</h1>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="zahlungsartFilter" class="input max-w-xs" @change="fetchZahlungen">
          <option value="">{{ $t('zahlungen.allPaymentTypes', 'Alle Zahlungsarten') }}</option>
          <option value="Barzahlung">{{ $t('zahlungen.type.cash', 'Barzahlung') }}</option>
          <option value="Karte">{{ $t('zahlungen.type.card', 'Kartenzahlung') }}</option>
          <option value="Ueberweisung">{{ $t('zahlungen.type.transfer', 'Uberweisung') }}</option>
          <option value="PayPal">{{ $t('zahlungen.type.paypal', 'PayPal') }}</option>
          <option value="Lastschrift">{{ $t('zahlungen.type.directDebit', 'Lastschrift') }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="zahlungen"
        :loading="loading"
        :loading-text="$t('zahlungen.loading', 'Lade Zahlungen...')"
        :empty-text="$t('zahlungen.noPayments', 'Keine Zahlungen gefunden')"
        row-key="ZahlungsID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="15"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Zahlungsdatum="{ value }">
          <span class="text-secondary-900">{{ formatDateTime(value) }}</span>
        </template>

        <template #cell-Rechnung="{ row }">
          <div class="text-sm">
            <NuxtLink
              :to="`/rechnungen/details/${row.RechnungsID}`"
              class="font-medium text-primary-600 hover:underline"
            >
              {{ row.Rechnungen?.Rechnungsnummer || '-' }}
            </NuxtLink>
            <div class="text-secondary-500">{{ getKundenName(row.Rechnungen) }}</div>
          </div>
        </template>

        <template #cell-Betrag="{ value }">
          <span class="font-medium text-success-600">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-Zahlungsart="{ value }">
          <span :class="getPaymentTypeBadgeClass(value)">{{ formatPaymentType(value) }}</span>
        </template>

        <template #cell-Referenznummer="{ value }">
          <span class="text-sm text-secondary-600 font-mono">{{ value || '-' }}</span>
        </template>

        <template #cell-Benutzer="{ row }">
          <span class="text-sm text-secondary-600">
            {{ row.Benutzer ? `${row.Benutzer.Vorname} ${row.Benutzer.Nachname}` : '-' }}
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
  { label: t('menu.payments', 'Zahlungen'), to: '/zahlungen' }
])

const columns = [
  { key: 'Zahlungsdatum', label: t('zahlungen.date', 'Datum'), sortable: true },
  { key: 'Rechnung', label: t('zahlungen.invoice', 'Rechnung'), sortable: false },
  { key: 'Betrag', label: t('zahlungen.amount', 'Betrag'), sortable: true, align: 'right' as const },
  { key: 'Zahlungsart', label: t('zahlungen.paymentType', 'Zahlungsart'), sortable: true },
  { key: 'Referenznummer', label: t('zahlungen.reference', 'Referenz'), sortable: false },
  { key: 'Benutzer', label: t('zahlungen.bookedBy', 'Gebucht von'), sortable: false }
]

const zahlungen = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const zahlungsartFilter = ref('')

async function fetchZahlungen() {
  try {
    loading.value = true
    let url = '/api/zahlungen'
    const params = new URLSearchParams()

    if (searchQuery.value) params.append('search', searchQuery.value)
    if (zahlungsartFilter.value) params.append('zahlungsart', zahlungsartFilter.value)

    if (params.toString()) url += `?${params.toString()}`

    const response = await $fetch(url)
    zahlungen.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('zahlungen.errorLoading', 'Fehler beim Laden der Zahlungen'))
    console.error('Fetch Zahlungen Error:', err)
    zahlungen.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  fetchZahlungen()
}

function getKundenName(rechnung: any): string {
  if (!rechnung?.Kunden) return ''
  const kunde = rechnung.Kunden
  if (kunde.Firmenname) return kunde.Firmenname
  return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || 'Unbekannt'
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

function formatPaymentType(type: string): string {
  const map: Record<string, string> = {
    'Barzahlung': 'Barzahlung',
    'Karte': 'Kartenzahlung',
    'Ueberweisung': 'Uberweisung',
    'PayPal': 'PayPal',
    'Lastschrift': 'Lastschrift'
  }
  return map[type] || type
}

function getPaymentTypeBadgeClass(type: string): string {
  const baseClass = 'badge'
  switch (type) {
    case 'Barzahlung': return `${baseClass} badge-success`
    case 'Karte': return `${baseClass} badge-primary`
    case 'Ueberweisung': return `${baseClass} badge-info`
    case 'PayPal': return `${baseClass} badge-warning`
    case 'Lastschrift': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchZahlungen()
})
</script>
