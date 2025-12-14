<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('rabatte.listTitle', 'Rabatte') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/rabatte/create')">
        {{ $t('rabatte.newDiscount', 'Neuer Rabatt') }}
      </Button>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="rabatte"
        :loading="loading"
        :loading-text="$t('rabatte.loading', 'Lade Rabatte...')"
        :empty-text="$t('rabatte.noDiscounts', 'Keine Rabatte gefunden')"
        row-key="RabattID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="10"
        striped
        hoverable
      >
        <template #cell-Name="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Name }}</div>
          <div v-if="row.Gutscheincode" class="text-xs text-primary-600 font-mono">{{ row.Gutscheincode }}</div>
        </template>

        <template #cell-Wert="{ row }">
          <span class="font-medium text-secondary-900">
            {{ row.RabattTyp === 'Prozent' ? `${row.Wert}%` : formatCurrency(row.Wert) }}
          </span>
        </template>

        <template #cell-Anwendungsebene="{ value }">
          <span class="badge badge-info">{{ formatAnwendungsebene(value) }}</span>
        </template>

        <template #cell-Gueltigkeit="{ row }">
          <div class="text-sm">
            <div v-if="row.GueltigAb">{{ $t('rabatte.from', 'Ab') }}: {{ formatDate(row.GueltigAb) }}</div>
            <div v-if="row.GueltigBis">{{ $t('rabatte.until', 'Bis') }}: {{ formatDate(row.GueltigBis) }}</div>
            <div v-if="!row.GueltigAb && !row.GueltigBis" class="text-secondary-400">{{ $t('rabatte.unlimited', 'Unbegrenzt') }}</div>
          </div>
        </template>

        <template #cell-Status="{ value }">
          <span :class="getStatusBadgeClass(value)">{{ value }}</span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/rabatte/edit/${row.RabattID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.RabattID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Loschen bestatigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('rabatte.confirmDelete', 'Mochten Sie diesen Rabatt wirklich loschen?') }}
      </p>
      <p class="font-medium mt-2">{{ discountToDelete?.Name }}</p>
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
  { label: t('menu.discounts', 'Rabatte'), to: '/rabatte' }
])

const columns = [
  { key: 'Name', label: t('rabatte.name', 'Name'), sortable: true },
  { key: 'Wert', label: t('rabatte.value', 'Wert'), sortable: true, align: 'right' as const },
  { key: 'Anwendungsebene', label: t('rabatte.scope', 'Anwendung'), sortable: true },
  { key: 'Gueltigkeit', label: t('rabatte.validity', 'Gultigkeit'), sortable: false },
  { key: 'Status', label: t('rabatte.status', 'Status'), sortable: true }
]

const rabatte = ref<any[]>([])
const loading = ref(true)
const deletingId = ref<number | null>(null)
const showDeleteModal = ref(false)
const discountToDelete = ref<any>(null)

async function fetchRabatte() {
  try {
    loading.value = true
    const response = await $fetch('/api/rabatte')
    rabatte.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('rabatte.errorLoading', 'Fehler beim Laden der Rabatte'))
    console.error('Fetch Rabatte Error:', err)
    rabatte.value = []
  } finally {
    loading.value = false
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

function formatAnwendungsebene(level: string): string {
  const map: Record<string, string> = {
    'Bestellung': 'Bestellung',
    'Position': 'Position',
    'Kategorie': 'Kategorie',
    'Produkt': 'Produkt'
  }
  return map[level] || level
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Aktiv': return `${baseClass} badge-success`
    case 'Inaktiv': return `${baseClass} bg-secondary-100 text-secondary-700`
    case 'Abgelaufen': return `${baseClass} badge-warning`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function confirmDelete(discount: any) {
  discountToDelete.value = discount
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!discountToDelete.value) return

  const id = discountToDelete.value.RabattID
  try {
    deletingId.value = id
    await $fetch(`/api/rabatte?id=${id}`, { method: 'DELETE' })
    rabatte.value = rabatte.value.filter(r => r.RabattID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich geloscht'))
  } catch (err) {
    toast.error(t('rabatte.errorDeleting', 'Fehler beim Loschen des Rabatts'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    discountToDelete.value = null
  }
}

onMounted(() => {
  fetchRabatte()
})
</script>
