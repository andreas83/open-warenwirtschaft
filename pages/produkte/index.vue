<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('produkte.listTitle', 'Produkte') }}</h1>
      <div class="flex gap-2">
        <Button variant="secondary" icon="i-mdi-folder" @click="navigateTo('/produkte/kategorien')">
          {{ $t('produkte.categories', 'Kategorien') }}
        </Button>
        <Button icon="i-mdi-plus" @click="navigateTo('/produkte/create')">
          {{ $t('produkte.newProduct', 'Neues Produkt') }}
        </Button>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="produkte"
        :loading="loading"
        :loading-text="$t('produkte.loadingProducts', 'Lade Produkte...')"
        :empty-text="$t('produkte.noProductsFound', 'Keine Produkte gefunden')"
        row-key="ProduktID"
        searchable
        :search-placeholder="$t('produkte.searchPlaceholder', 'Suchen...')"
        paginated
        :page-size="pageSize"
        striped
        hoverable
        @search="handleSearch"
      >
        <template #cell-Produkt="{ row }">
          <div class="flex items-center gap-3">
            <div v-if="getMainImage(row)" class="w-12 h-12 flex-shrink-0">
              <img
                :src="getMainImage(row)"
                :alt="row.Name"
                class="w-full h-full object-cover rounded-md border border-secondary-200"
              />
            </div>
            <div v-else class="w-12 h-12 flex-shrink-0 bg-secondary-100 rounded-md flex items-center justify-center">
              <span class="i-mdi-package-variant w-6 h-6 text-secondary-400"></span>
            </div>
            <div>
              <div class="font-medium text-secondary-900">{{ row.Name }}</div>
              <div class="text-sm text-secondary-500 line-clamp-1">{{ row.Beschreibung || '-' }}</div>
            </div>
          </div>
        </template>

        <template #cell-Kategorie="{ row }">
          <span v-if="row.Produktkategorien" class="badge badge-primary">
            {{ row.Produktkategorien.Name }}
          </span>
          <span v-else class="text-secondary-400">-</span>
        </template>

        <template #cell-Preis="{ row }">
          <div class="text-right">
            <div class="font-medium text-secondary-900">{{ formatPrice(getStandardPrice(row)) }}</div>
            <div v-if="getActionPrice(row)" class="text-sm text-danger-600 line-through">
              {{ formatPrice(getActionPrice(row)) }}
            </div>
          </div>
        </template>

        <template #cell-Bestand="{ row }">
          <div class="text-right">
            <span :class="getBestandClass(row)">
              {{ getBestand(row) }}
            </span>
          </div>
        </template>

        <template #rowActions="{ row }">
          <div class="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-pencil"
              @click="navigateTo(`/produkte/edit/${row.ProduktID}`)"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="i-mdi-delete"
              class="text-danger-600 hover:bg-danger-50"
              :loading="deletingId === row.ProduktID"
              @click="confirmDelete(row)"
            />
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal v-model="showDeleteModal" :title="$t('common.confirmDelete', 'Löschen bestätigen')" variant="danger" size="sm">
      <p class="text-secondary-600">
        {{ $t('produkte.confirmDeleteProduct', 'Möchten Sie dieses Produkt wirklich löschen?') }}
      </p>
      <p class="font-medium mt-2">{{ productToDelete?.Name }}</p>
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
const { t, locale } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.products', 'Produkte'), to: '/produkte' }
])

const columns = [
  { key: 'Produkt', label: t('produkte.product', 'Produkt'), sortable: false },
  { key: 'Kategorie', label: t('produkte.category', 'Kategorie'), sortable: true },
  { key: 'Preis', label: t('produkte.price', 'Preis'), sortable: true, align: 'right' as const },
  { key: 'Bestand', label: t('produkte.stock', 'Bestand'), sortable: true, align: 'right' as const }
]

const produkte = ref([])
const loading = ref(true)
const searchQuery = ref('')
const pageSize = ref(10)
const deletingId = ref(null)
const showDeleteModal = ref(false)
const productToDelete = ref(null)

async function fetchProdukte() {
  try {
    loading.value = true
    let url = '/api/produkte'
    if (searchQuery.value) {
      url += `?search=${encodeURIComponent(searchQuery.value)}`
    }
    const response = await $fetch(url)
    if (response?.data && Array.isArray(response.data)) {
      produkte.value = response.data
    } else if (Array.isArray(response)) {
      produkte.value = response
    } else {
      produkte.value = []
    }
  } catch (err) {
    toast.error(t('produkte.errorLoadingProducts', 'Fehler beim Laden der Produkte'))
    console.error('Fetch Produkte Error:', err)
    produkte.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  searchQuery.value = query
  fetchProdukte()
}

function getMainImage(produkt: any): string {
  if (produkt.ProduktBilder && produkt.ProduktBilder.length > 0) {
    const mainImage = produkt.ProduktBilder.find((img: any) => img.IstHauptbild)
    return mainImage ? mainImage.BildPfad : produkt.ProduktBilder[0].BildPfad
  }
  return ''
}

function getStandardPrice(produkt: any): number {
  if (produkt.Preise && produkt.Preise.length > 0) {
    const standardPrice = produkt.Preise.find((p: any) => p.PreisTyp === 'Standard')
    return standardPrice ? parseFloat(standardPrice.Preis) : 0
  }
  return 0
}

function getActionPrice(produkt: any): number | null {
  if (produkt.Preise && produkt.Preise.length > 0) {
    const actionPrice = produkt.Preise.find((p: any) => p.PreisTyp === 'Aktion')
    return actionPrice ? parseFloat(actionPrice.Preis) : null
  }
  return null
}

function getBestand(produkt: any): string {
  if (produkt.Bestand && produkt.Bestand.length > 0) {
    const total = produkt.Bestand.reduce((sum: number, b: any) => sum + (b.Menge || 0), 0)
    return total.toString()
  }
  return '-'
}

function getBestandClass(produkt: any): string {
  const bestand = getBestand(produkt)
  if (bestand === '-') return 'text-secondary-400'
  const total = parseInt(bestand)
  if (total <= 0) return 'badge badge-danger'
  if (total < 10) return 'badge badge-warning'
  return 'badge badge-success'
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function confirmDelete(product: any) {
  productToDelete.value = product
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!productToDelete.value) return

  const id = productToDelete.value.ProduktID
  try {
    deletingId.value = id
    await $fetch(`/api/produkte?id=${id}`, { method: 'DELETE' })
    produkte.value = produkte.value.filter((p: any) => p.ProduktID !== id)
    toast.success(t('common.deleteSuccess', 'Erfolgreich gelöscht'))
  } catch (err) {
    toast.error(t('produkte.errorDeletingProduct', 'Fehler beim Löschen des Produkts'))
  } finally {
    deletingId.value = null
    showDeleteModal.value = false
    productToDelete.value = null
  }
}

onMounted(() => {
  fetchProdukte()
})
</script>
