<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kreditmanagement.title', 'Kreditmanagement') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/kreditmanagement/create')">
        {{ $t('kreditmanagement.newLimit', 'Neues Kreditlimit') }}
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('kreditmanagement.totalCustomers', 'Kunden') }}</div>
        <div class="text-2xl font-bold text-secondary-900">{{ stats.totalCustomers }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('kreditmanagement.blocked', 'Gesperrt') }}</div>
        <div class="text-2xl font-bold text-danger-600">{{ stats.blockedCustomers }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('kreditmanagement.totalLimit', 'Kreditrahmen') }}</div>
        <div class="text-2xl font-bold text-secondary-900">{{ formatCurrency(stats.totalCreditLimit) }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('kreditmanagement.totalDebt', 'Offene Schuld') }}</div>
        <div class="text-2xl font-bold text-warning-600">{{ formatCurrency(stats.totalDebt) }}</div>
      </div>
      <div class="card p-4">
        <div class="text-sm text-secondary-500">{{ $t('kreditmanagement.openReminders', 'Offene Mahnungen') }}</div>
        <div class="text-2xl font-bold text-danger-600">{{ stats.openReminders }}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="card mb-4">
      <div class="border-b border-secondary-200">
        <nav class="flex gap-4 px-4" aria-label="Tabs">
          <button
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'limits'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            ]"
            @click="activeTab = 'limits'"
          >
            {{ $t('kreditmanagement.creditLimits', 'Kreditlimits') }}
          </button>
          <button
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'reminders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            ]"
            @click="activeTab = 'reminders'; fetchMahnungen()"
          >
            {{ $t('kreditmanagement.reminders', 'Mahnungen') }}
            <span v-if="stats.openReminders" class="ml-2 badge badge-danger">{{ stats.openReminders }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Credit Limits Table -->
    <div v-if="activeTab === 'limits'" class="card">
      <DataTable
        :columns="limitColumns"
        :data="kreditlimits"
        :loading="loading"
        :loading-text="$t('kreditmanagement.loading', 'Lade Kreditlimits...')"
        :empty-text="$t('kreditmanagement.noLimits', 'Keine Kreditlimits gefunden')"
        row-key="KreditlimitID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="15"
        striped
        hoverable
      >
        <template #cell-Kunde="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Kunden?.Firmenname || row.Kunden?.Vorname + ' ' + row.Kunden?.Nachname }}</div>
          <div class="text-sm text-secondary-500">{{ row.Kunden?.Kundennummer }}</div>
        </template>

        <template #cell-Kreditlimit="{ value }">
          <span class="font-medium text-secondary-900">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell-AktuelleSchuld="{ value, row }">
          <div class="text-right">
            <span :class="getDebtClass(value, row.Kreditlimit)">{{ formatCurrency(value) }}</span>
            <div class="w-full bg-secondary-200 rounded-full h-1.5 mt-1">
              <div
                :class="['h-1.5 rounded-full', getUtilizationBarClass(value, row.Kreditlimit)]"
                :style="{ width: `${Math.min(100, (Number(value) / Number(row.Kreditlimit)) * 100)}%` }"
              ></div>
            </div>
          </div>
        </template>

        <template #cell-Zahlungsziel="{ value }">
          <span class="text-secondary-700">{{ value }} {{ $t('kreditmanagement.days', 'Tage') }}</span>
        </template>

        <template #cell-OffeneMahnungen="{ row }">
          <span v-if="row.Mahnungen?.length" class="badge badge-danger">
            {{ row.Mahnungen.length }}
          </span>
          <span v-else class="text-secondary-400">-</span>
        </template>

        <template #cell-Kreditsperre="{ value, row }">
          <span v-if="value" class="badge badge-danger">
            {{ $t('kreditmanagement.blocked', 'Gesperrt') }}
          </span>
          <span v-else class="badge badge-success">
            {{ $t('kreditmanagement.active', 'Aktiv') }}
          </span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/kreditmanagement/edit/${row.KreditlimitID}`)"
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

    <!-- Reminders Table -->
    <div v-if="activeTab === 'reminders'" class="card">
      <div class="p-4 border-b border-secondary-200">
        <select v-model="reminderStatusFilter" class="input max-w-xs" @change="fetchMahnungen">
          <option value="">{{ $t('kreditmanagement.allStatuses', 'Alle Status') }}</option>
          <option value="Offen">{{ $t('kreditmanagement.reminderStatus.open', 'Offen') }}</option>
          <option value="Versendet">{{ $t('kreditmanagement.reminderStatus.sent', 'Versendet') }}</option>
          <option value="Bezahlt">{{ $t('kreditmanagement.reminderStatus.paid', 'Bezahlt') }}</option>
          <option value="Storniert">{{ $t('kreditmanagement.reminderStatus.cancelled', 'Storniert') }}</option>
        </select>
      </div>

      <DataTable
        :columns="reminderColumns"
        :data="mahnungen"
        :loading="loadingMahnungen"
        :loading-text="$t('kreditmanagement.loadingReminders', 'Lade Mahnungen...')"
        :empty-text="$t('kreditmanagement.noReminders', 'Keine Mahnungen gefunden')"
        row-key="MahnungID"
        paginated
        :page-size="15"
        striped
        hoverable
      >
        <template #cell-Mahnungsnummer="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Mahnungsnummer }}</div>
          <div class="text-sm text-secondary-500">{{ formatDate(row.Mahnungsdatum) }}</div>
        </template>

        <template #cell-Kunde="{ row }">
          <div class="text-sm">
            <div class="text-secondary-900">{{ row.Kreditlimits?.Kunden?.Firmenname || row.Kreditlimits?.Kunden?.Vorname + ' ' + row.Kreditlimits?.Kunden?.Nachname }}</div>
          </div>
        </template>

        <template #cell-Rechnung="{ row }">
          <span class="font-mono text-sm text-secondary-700">{{ row.Rechnungen?.Rechnungsnummer }}</span>
        </template>

        <template #cell-Mahnstufe="{ value }">
          <span :class="getReminderLevelBadge(value)">{{ $t('kreditmanagement.level', 'Stufe') }} {{ value }}</span>
        </template>

        <template #cell-Mahnbetrag="{ value, row }">
          <div class="text-right">
            <div class="font-medium text-secondary-900">{{ formatCurrency(value) }}</div>
            <div v-if="row.Mahngebuehr" class="text-xs text-secondary-500">
              +{{ formatCurrency(row.Mahngebuehr) }} {{ $t('kreditmanagement.fee', 'Gebuhr') }}
            </div>
          </div>
        </template>

        <template #cell-Faelligkeitsdatum="{ value }">
          <span :class="isOverdue(value) ? 'text-danger-600 font-medium' : 'text-secondary-700'">
            {{ formatDate(value) }}
          </span>
        </template>

        <template #cell-Status="{ value }">
          <span :class="getReminderStatusBadge(value)">{{ value }}</span>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('kreditmanagement.deleteLimit', 'Kreditlimit loschen')">
      <p class="text-secondary-700">
        {{ $t('kreditmanagement.deleteConfirm', 'Mochten Sie das Kreditlimit fur "{name}" wirklich loschen?', { name: limitToDelete?.Kunden?.Firmenname || limitToDelete?.Kunden?.Vorname + ' ' + limitToDelete?.Kunden?.Nachname }) }}
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showDeleteModal = false">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button variant="danger" :loading="deleting" @click="deleteLimit">
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
  { label: t('menu.creditManagement', 'Kreditmanagement'), to: '/kreditmanagement' }
])

const limitColumns = [
  { key: 'Kunde', label: t('kreditmanagement.customer', 'Kunde'), sortable: true },
  { key: 'Kreditlimit', label: t('kreditmanagement.creditLimit', 'Kreditlimit'), sortable: true, align: 'right' as const },
  { key: 'AktuelleSchuld', label: t('kreditmanagement.currentDebt', 'Aktuelle Schuld'), sortable: true, align: 'right' as const },
  { key: 'Zahlungsziel', label: t('kreditmanagement.paymentTerms', 'Zahlungsziel'), sortable: true, align: 'center' as const },
  { key: 'OffeneMahnungen', label: t('kreditmanagement.reminders', 'Mahnungen'), sortable: false, align: 'center' as const },
  { key: 'Kreditsperre', label: t('kreditmanagement.status', 'Status'), sortable: true }
]

const reminderColumns = [
  { key: 'Mahnungsnummer', label: t('kreditmanagement.reminderNumber', 'Mahnung'), sortable: true },
  { key: 'Kunde', label: t('kreditmanagement.customer', 'Kunde'), sortable: false },
  { key: 'Rechnung', label: t('kreditmanagement.invoice', 'Rechnung'), sortable: false },
  { key: 'Mahnstufe', label: t('kreditmanagement.level', 'Stufe'), sortable: true, align: 'center' as const },
  { key: 'Mahnbetrag', label: t('kreditmanagement.amount', 'Betrag'), sortable: true, align: 'right' as const },
  { key: 'Faelligkeitsdatum', label: t('kreditmanagement.dueDate', 'Fallig'), sortable: true },
  { key: 'Status', label: t('kreditmanagement.status', 'Status'), sortable: true }
]

const activeTab = ref<'limits' | 'reminders'>('limits')
const kreditlimits = ref<any[]>([])
const mahnungen = ref<any[]>([])
const stats = ref({
  totalCustomers: 0,
  blockedCustomers: 0,
  totalCreditLimit: 0,
  totalDebt: 0,
  openReminders: 0
})
const loading = ref(true)
const loadingMahnungen = ref(false)
const reminderStatusFilter = ref('')
const showDeleteModal = ref(false)
const limitToDelete = ref<any>(null)
const deleting = ref(false)

async function fetchKreditlimits() {
  try {
    loading.value = true
    const response = await $fetch('/api/kreditmanagement')
    kreditlimits.value = response?.creditLimits || []
    if (response?.stats) {
      stats.value = response.stats
    }
  } catch (err) {
    toast.error(t('kreditmanagement.errorLoading', 'Fehler beim Laden der Kreditlimits'))
    console.error('Fetch Kreditlimits Error:', err)
    kreditlimits.value = []
  } finally {
    loading.value = false
  }
}

async function fetchMahnungen() {
  try {
    loadingMahnungen.value = true
    let url = '/api/kreditmanagement?type=mahnungen'
    if (reminderStatusFilter.value) {
      url += `&status=${reminderStatusFilter.value}`
    }
    const response = await $fetch(url)
    mahnungen.value = response?.reminders || []
  } catch (err) {
    toast.error(t('kreditmanagement.errorLoadingReminders', 'Fehler beim Laden der Mahnungen'))
    console.error('Fetch Mahnungen Error:', err)
    mahnungen.value = []
  } finally {
    loadingMahnungen.value = false
  }
}

function confirmDelete(limit: any) {
  limitToDelete.value = limit
  showDeleteModal.value = true
}

async function deleteLimit() {
  if (!limitToDelete.value) return

  try {
    deleting.value = true
    const response = await $fetch(`/api/kreditmanagement?id=${limitToDelete.value.KreditlimitID}`, {
      method: 'DELETE'
    })
    if (response?.status === 400) {
      toast.error(response.error || t('kreditmanagement.errorDeleting', 'Fehler beim Loschen'))
      return
    }
    toast.success(t('kreditmanagement.deleteSuccess', 'Kreditlimit erfolgreich geloscht'))
    showDeleteModal.value = false
    limitToDelete.value = null
    fetchKreditlimits()
  } catch (err: any) {
    toast.error(t('kreditmanagement.errorDeleting', 'Fehler beim Loschen'))
    console.error('Delete Limit Error:', err)
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

function getDebtClass(debt: number, limit: number): string {
  const ratio = Number(debt) / Number(limit)
  if (ratio >= 1) return 'text-danger-600 font-medium'
  if (ratio >= 0.8) return 'text-warning-600 font-medium'
  return 'text-secondary-900'
}

function getUtilizationBarClass(debt: number, limit: number): string {
  const ratio = Number(debt) / Number(limit)
  if (ratio >= 1) return 'bg-danger-500'
  if (ratio >= 0.8) return 'bg-warning-500'
  if (ratio >= 0.5) return 'bg-info-500'
  return 'bg-success-500'
}

function getReminderLevelBadge(level: number): string {
  const baseClass = 'badge'
  switch (level) {
    case 1: return `${baseClass} badge-warning`
    case 2: return `${baseClass} bg-orange-100 text-orange-700`
    case 3: return `${baseClass} badge-danger`
    default: return `${baseClass} badge-danger`
  }
}

function getReminderStatusBadge(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Offen': return `${baseClass} badge-warning`
    case 'Versendet': return `${baseClass} badge-info`
    case 'Bezahlt': return `${baseClass} badge-success`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function isOverdue(date: string): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

onMounted(() => {
  fetchKreditlimits()
})
</script>
