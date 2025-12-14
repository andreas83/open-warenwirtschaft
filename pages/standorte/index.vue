<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('standorte.listTitle', 'Standorte') }}</h1>
      <div class="flex gap-2">
        <Button
          v-if="typeFilter"
          variant="secondary"
          icon="i-mdi-filter-off"
          @click="typeFilter = ''"
        >
          {{ typeFilter }}
        </Button>
        <Button icon="i-mdi-plus" @click="navigateTo('/standorte/create')">
          {{ $t('standorte.newLocation', 'Neuer Standort') }}
        </Button>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="filteredStandorte"
        :loading="loading"
        :loading-text="$t('standorte.loadingLocations', 'Lade Standorte...')"
        :empty-text="$t('standorte.noLocationsFound', 'Keine Standorte gefunden')"
        row-key="StandortID"
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
            <div v-if="row.PLZ || row.Ort" class="text-secondary-500">
              {{ row.PLZ }} {{ row.Ort }}<span v-if="row.Land">, {{ row.Land }}</span>
            </div>
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

        <template #cell-Typ="{ value, row }">
          <button
            class="badge badge-primary cursor-pointer hover:opacity-80"
            @click.stop="typeFilter = row.Typ"
          >
            {{ value || '-' }}
          </button>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/standorte/edit/${row.StandortID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.StandortID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Löschen bestätigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('standorte.confirmDeleteLocation', 'Möchten Sie diesen Standort wirklich löschen?') }}
      </p>
      <p class="font-medium mt-2">{{ locationToDelete?.Name }}</p>
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
  { label: t('menu.locations', 'Standorte'), to: '/standorte' }
])

const columns = [
  { key: 'Name', label: t('standorte.name', 'Name'), sortable: true },
  { key: 'Adresse', label: t('standorte.address', 'Adresse'), sortable: false },
  { key: 'Kontakt', label: t('standorte.contact', 'Kontakt'), sortable: false },
  { key: 'Typ', label: t('standorte.type', 'Typ'), sortable: true }
]

const standorte = ref([])
const loading = ref(true)
const searchQuery = ref('')
const typeFilter = ref('')
const pageSize = ref(10)
const deletingId = ref(null)
const showDeleteModal = ref(false)
const locationToDelete = ref(null)

const filteredStandorte = computed(() => {
  if (!typeFilter.value) return standorte.value
  return standorte.value.filter(s => s.Typ === typeFilter.value)
})

async function fetchStandorte() {
  try {
    loading.value = true
    let url = '/api/standorte'
    if (searchQuery.value) {
      url += `?search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    standorte.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('standorte.errorLoadingLocations', 'Fehler beim Laden der Standorte'))
    console.error('Fetch Standorte Error:', err)
    standorte.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  fetchStandorte()
}

function confirmDelete(location: any) {
  locationToDelete.value = location
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!locationToDelete.value) return

  const id = locationToDelete.value.StandortID
  try {
    deletingId.value = id
    await $fetch(`/api/standorte?id=${id}`, { method: 'DELETE' })
    standorte.value = standorte.value.filter(s => s.StandortID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich gelöscht'))
  } catch (err) {
    toast.error(t('standorte.errorDeletingLocation', 'Fehler beim Löschen des Standorts'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    locationToDelete.value = null
  }
}

onMounted(() => {
  fetchStandorte()
})
</script>
