<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kunden.listTitle', 'Kunden') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/kunden/create')">
        {{ $t('kunden.newCustomer', 'Neuer Kunde') }}
      </Button>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="kunden"
        :loading="loading"
        :loading-text="$t('kunden.loadingCustomers', 'Lade Kunden...')"
        :empty-text="$t('kunden.noCustomersFound', 'Keine Kunden gefunden')"
        row-key="KundenID"
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
          <div class="text-sm text-secondary-500">{{ row.Kundennummer || '-' }}</div>
        </template>

        <template #cell-Adresse="{ row }">
          <div class="text-sm">
            <div>{{ row.Adresse || '-' }}</div>
            <div class="text-secondary-500">{{ row.PLZ }} {{ row.Ort }}</div>
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

        <template #cell-Kundenstatus="{ value }">
          <span :class="[
            'badge',
            value === 'Aktiv' ? 'badge-success' : 'badge-secondary'
          ]">
            {{ value || 'Unbekannt' }}
          </span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/kunden/edit/${row.KundenID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.KundenID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Löschen bestätigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('kunden.confirmDeleteCustomer', 'Möchten Sie diesen Kunden wirklich löschen?') }}
      </p>
      <p class="font-medium mt-2">{{ customerToDelete?.Name }}</p>
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
  { label: t('menu.customers', 'Kunden'), to: '/kunden' }
])

const columns = [
  { key: 'Name', label: t('kunden.name', 'Name'), sortable: true },
  { key: 'Adresse', label: t('kunden.address', 'Adresse'), sortable: false },
  { key: 'Kontakt', label: t('kunden.contact', 'Kontakt'), sortable: false },
  { key: 'Kundenstatus', label: t('kunden.status', 'Status'), sortable: true }
]

const kunden = ref([])
const loading = ref(true)
const searchQuery = ref('')
const pageSize = ref(10)
const deletingId = ref(null)
const showDeleteModal = ref(false)
const customerToDelete = ref(null)

async function fetchKunden() {
  try {
    loading.value = true
    let url = '/api/kunden'
    if (searchQuery.value) {
      url += `?search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    if (response && Array.isArray(response)) {
      kunden.value = response
    } else if (response?.data && Array.isArray(response.data)) {
      kunden.value = response.data
    } else {
      kunden.value = []
    }
  } catch (err) {
    toast.error(t('kunden.errorLoadingCustomers', 'Fehler beim Laden der Kunden'))
    console.error('Fetch Kunden Error:', err)
    kunden.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  fetchKunden()
}

function confirmDelete(customer: any) {
  customerToDelete.value = customer
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!customerToDelete.value) return

  const id = customerToDelete.value.KundenID
  try {
    deletingId.value = id
    await $fetch(`/api/kunden?id=${id}`, { method: 'DELETE' })
    kunden.value = kunden.value.filter(k => k.KundenID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich gelöscht'))
  } catch (err) {
    toast.error(t('kunden.errorDeletingCustomer', 'Fehler beim Löschen des Kunden'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    customerToDelete.value = null
  }
}

onMounted(() => {
  fetchKunden()
})
</script>
