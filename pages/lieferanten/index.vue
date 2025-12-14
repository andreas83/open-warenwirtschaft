<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('lieferanten.listTitle', 'Lieferanten') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/lieferanten/create')">
        {{ $t('lieferanten.newSupplier', 'Neuer Lieferant') }}
      </Button>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="lieferanten"
        :loading="loading"
        :loading-text="$t('lieferanten.loadingSuppliers', 'Lade Lieferanten...')"
        :empty-text="$t('lieferanten.noSuppliersFound', 'Keine Lieferanten gefunden')"
        row-key="LieferantenID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="pageSize"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Name="{ row }">
          <div class="font-medium text-secondary-900">{{ row.Name }}</div>
        </template>

        <template #cell-Adresse="{ row }">
          <div class="text-sm">
            <div>{{ row.Adresse || '-' }}</div>
            <div v-if="row.PLZ || row.Ort" class="text-secondary-500">{{ row.PLZ }} {{ row.Ort }}</div>
          </div>
        </template>

        <template #cell-Kontakt="{ row }">
          <div class="text-sm">
            <div v-if="row.Telefon" class="flex items-center gap-1">
              <span class="i-mdi-phone w-4 h-4 text-secondary-400"></span>
              {{ row.Telefon }}
            </div>
            <div v-if="row.Email" class="flex items-center gap-1 text-primary-600">
              <span class="i-mdi-email w-4 h-4"></span>
              {{ row.Email }}
            </div>
          </div>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/lieferanten/edit/${row.LieferantenID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.LieferantenID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Löschen bestätigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('lieferanten.confirmDeleteSupplier', 'Möchten Sie diesen Lieferanten wirklich löschen?') }}
      </p>
      <p class="font-medium mt-2">{{ supplierToDelete?.Name }}</p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showDeleteModal = false">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button variant="danger" :loading="deletingId !== null" @click="handleDelete">
            {{ $t('common.delete', 'Löschen') }}
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
  { label: t('menu.suppliers', 'Lieferanten'), to: '/lieferanten' }
])

const columns = [
  { key: 'Name', label: t('lieferanten.name', 'Name'), sortable: true },
  { key: 'Adresse', label: t('lieferanten.address', 'Adresse'), sortable: false },
  { key: 'Kontakt', label: t('lieferanten.contact', 'Kontakt'), sortable: false }
]

const lieferanten = ref([])
const loading = ref(true)
const searchQuery = ref('')
const pageSize = ref(10)
const deletingId = ref(null)
const showDeleteModal = ref(false)
const supplierToDelete = ref(null)

async function fetchLieferanten() {
  try {
    loading.value = true
    let url = '/api/lieferanten'
    if (searchQuery.value) {
      url += `?search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    if (response?.data && Array.isArray(response.data)) {
      lieferanten.value = response.data
    } else if (Array.isArray(response)) {
      lieferanten.value = response
    } else {
      lieferanten.value = []
    }
  } catch (err) {
    toast.error(t('lieferanten.errorLoadingSuppliers', 'Fehler beim Laden der Lieferanten'))
    console.error('Fetch Lieferanten Error:', err)
    lieferanten.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  fetchLieferanten()
}

function confirmDelete(supplier: any) {
  supplierToDelete.value = supplier
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!supplierToDelete.value) return

  const id = supplierToDelete.value.LieferantenID
  try {
    deletingId.value = id
    await $fetch(`/api/lieferanten?id=${id}`, { method: 'DELETE' })
    lieferanten.value = lieferanten.value.filter(l => l.LieferantenID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich gelöscht'))
  } catch (err) {
    toast.error(t('lieferanten.errorDeletingSupplier', 'Fehler beim Löschen des Lieferanten'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    supplierToDelete.value = null
  }
}

onMounted(() => {
  fetchLieferanten()
})
</script>
