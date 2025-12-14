<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kundengruppen.listTitle', 'Kundengruppen') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/kundengruppen/create')">
        {{ $t('kundengruppen.newGroup', 'Neue Kundengruppe') }}
      </Button>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="kundengruppen"
        :loading="loading"
        :loading-text="$t('kundengruppen.loading', 'Lade Kundengruppen...')"
        :empty-text="$t('kundengruppen.noGroups', 'Keine Kundengruppen gefunden')"
        row-key="KundengruppeID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="10"
        striped
        hoverable
      >
        <template #cell-Name="{ value }">
          <span class="font-medium text-secondary-900">{{ value }}</span>
        </template>

        <template #cell-Beschreibung="{ value }">
          <span class="text-sm text-secondary-600 line-clamp-2">{{ value || '-' }}</span>
        </template>

        <template #cell-Erstelldatum="{ value }">
          <span class="text-sm text-secondary-500">{{ formatDate(value) }}</span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/kundengruppen/edit/${row.KundengruppeID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.KundengruppeID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Loschen bestatigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('kundengruppen.confirmDelete', 'Mochten Sie diese Kundengruppe wirklich loschen?') }}
      </p>
      <p class="font-medium mt-2">{{ groupToDelete?.Name }}</p>
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
  { label: t('menu.customerGroups', 'Kundengruppen'), to: '/kundengruppen' }
])

const columns = [
  { key: 'Name', label: t('kundengruppen.name', 'Name'), sortable: true },
  { key: 'Beschreibung', label: t('kundengruppen.description', 'Beschreibung'), sortable: false },
  { key: 'Erstelldatum', label: t('kundengruppen.createdAt', 'Erstellt'), sortable: true }
]

const kundengruppen = ref<any[]>([])
const loading = ref(true)
const deletingId = ref<number | null>(null)
const showDeleteModal = ref(false)
const groupToDelete = ref<any>(null)

async function fetchKundengruppen() {
  try {
    loading.value = true
    const response = await $fetch('/api/kundengruppen')
    kundengruppen.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('kundengruppen.errorLoading', 'Fehler beim Laden der Kundengruppen'))
    console.error('Fetch Kundengruppen Error:', err)
    kundengruppen.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
}

function confirmDelete(group: any) {
  groupToDelete.value = group
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!groupToDelete.value) return

  const id = groupToDelete.value.KundengruppeID
  try {
    deletingId.value = id
    await $fetch(`/api/kundengruppen?id=${id}`, { method: 'DELETE' })
    kundengruppen.value = kundengruppen.value.filter(g => g.KundengruppeID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich geloscht'))
  } catch (err) {
    toast.error(t('kundengruppen.errorDeleting', 'Fehler beim Loschen der Kundengruppe'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    groupToDelete.value = null
  }
}

onMounted(() => {
  fetchKundengruppen()
})
</script>
