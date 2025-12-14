<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kategorien.listTitle', 'Produktkategorien') }}</h1>
      <Button icon="i-mdi-plus" @click="navigateTo('/kategorien/create')">
        {{ $t('kategorien.newCategory', 'Neue Kategorie') }}
      </Button>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="kategorien"
        :loading="loading"
        :loading-text="$t('kategorien.loading', 'Lade Kategorien...')"
        :empty-text="$t('kategorien.noCategories', 'Keine Kategorien gefunden')"
        row-key="KategorieID"
        searchable
        :search-placeholder="$t('common.search', 'Suchen...')"
        paginated
        :page-size="10"
        striped
        hoverable
      >
        <template #cell-Name="{ row }">
          <div class="flex items-center gap-3">
            <div v-if="getCategoryImage(row)" class="w-10 h-10 flex-shrink-0">
              <img
                :src="getCategoryImage(row)"
                :alt="row.Name"
                class="w-full h-full object-cover rounded-md border border-secondary-200"
              />
            </div>
            <div v-else class="w-10 h-10 flex-shrink-0 bg-secondary-100 rounded-md flex items-center justify-center">
              <span class="i-mdi-folder w-5 h-5 text-secondary-400"></span>
            </div>
            <div>
              <div class="font-medium text-secondary-900">{{ row.Name }}</div>
              <div v-if="row.UebergeordneteKategorieID" class="text-xs text-secondary-500">
                Unterkategorie
              </div>
            </div>
          </div>
        </template>

        <template #cell-Beschreibung="{ value }">
          <span class="text-sm text-secondary-600 line-clamp-2">{{ value || '-' }}</span>
        </template>

        <template #cell-Produkte="{ row }">
          <span class="badge badge-primary">
            {{ row._count?.ProduktZuKategorie || 0 }} Produkte
          </span>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/kategorien/edit/${row.KategorieID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.KategorieID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Löschen bestätigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('kategorien.confirmDelete', 'Möchten Sie diese Kategorie wirklich löschen?') }}
      </p>
      <p class="font-medium mt-2">{{ categoryToDelete?.Name }}</p>
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
  { label: t('menu.categories', 'Kategorien'), to: '/kategorien' }
])

const columns = [
  { key: 'Name', label: t('kategorien.name', 'Name'), sortable: true },
  { key: 'Beschreibung', label: t('kategorien.description', 'Beschreibung'), sortable: false },
  { key: 'Produkte', label: t('kategorien.products', 'Produkte'), sortable: false, align: 'center' as const }
]

const kategorien = ref([])
const loading = ref(true)
const deletingId = ref<number | null>(null)
const showDeleteModal = ref(false)
const categoryToDelete = ref<any>(null)

async function fetchKategorien() {
  try {
    loading.value = true
    const response = await $fetch('/api/produktkategorien')
    kategorien.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('kategorien.errorLoading', 'Fehler beim Laden der Kategorien'))
    console.error('Fetch Kategorien Error:', err)
    kategorien.value = []
  } finally {
    loading.value = false
  }
}

function getCategoryImage(kategorie: any): string {
  if (kategorie.KategorieBilder && kategorie.KategorieBilder.length > 0) {
    const mainImage = kategorie.KategorieBilder.find((img: any) => img.IstHauptbild)
    return mainImage ? mainImage.BildPfad : kategorie.KategorieBilder[0].BildPfad
  }
  return ''
}

function confirmDelete(category: any) {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!categoryToDelete.value) return

  const id = categoryToDelete.value.KategorieID
  try {
    deletingId.value = id
    await $fetch(`/api/produktkategorien?id=${id}`, { method: 'DELETE' })
    kategorien.value = kategorien.value.filter((k: any) => k.KategorieID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich gelöscht'))
  } catch (err) {
    toast.error(t('kategorien.errorDeleting', 'Fehler beim Löschen der Kategorie'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    categoryToDelete.value = null
  }
}

onMounted(() => {
  fetchKategorien()
})
</script>
