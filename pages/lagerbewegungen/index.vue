<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('lagerbewegungen.listTitle', 'Lagerbewegungen') }}</h1>
      <Button icon="i-mdi-plus" @click="showCreateModal = true">
        {{ $t('lagerbewegungen.newMovement', 'Neue Bewegung') }}
      </Button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="p-4 flex flex-col lg:flex-row gap-4">
        <select v-model="typFilter" class="input max-w-xs" @change="fetchBewegungen">
          <option value="">{{ $t('lagerbewegungen.allTypes', 'Alle Bewegungstypen') }}</option>
          <option value="Eingang">{{ $t('lagerbewegungen.type.incoming', 'Eingang') }}</option>
          <option value="Ausgang">{{ $t('lagerbewegungen.type.outgoing', 'Ausgang') }}</option>
          <option value="Umbuchung">{{ $t('lagerbewegungen.type.transfer', 'Umbuchung') }}</option>
          <option value="Inventur">{{ $t('lagerbewegungen.type.inventory', 'Inventur') }}</option>
          <option value="Korrektur_Plus">{{ $t('lagerbewegungen.type.correctionPlus', 'Korrektur +') }}</option>
          <option value="Korrektur_Minus">{{ $t('lagerbewegungen.type.correctionMinus', 'Korrektur -') }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <DataTable
        :columns="columns"
        :data="bewegungen"
        :loading="loading"
        :loading-text="$t('lagerbewegungen.loading', 'Lade Lagerbewegungen...')"
        :empty-text="$t('lagerbewegungen.noMovements', 'Keine Lagerbewegungen gefunden')"
        row-key="LagerbewegungID"
        paginated
        :page-size="15"
        striped
        hoverable
      >
        <template #cell-Bewegungsdatum="{ value }">
          <span class="text-secondary-900">{{ formatDateTime(value) }}</span>
        </template>

        <template #cell-Produkt="{ row }">
          <div class="text-sm">
            <div class="font-medium text-secondary-900">{{ row.Bestand?.Produkte?.Produktname || '-' }}</div>
            <div class="text-secondary-500">{{ row.Bestand?.Standorte?.Name || '-' }}</div>
          </div>
        </template>

        <template #cell-Bewegungstyp="{ value }">
          <span :class="getMovementTypeBadge(value)">{{ formatMovementType(value) }}</span>
        </template>

        <template #cell-Menge="{ value, row }">
          <span :class="isPositiveMovement(row.Bewegungstyp) ? 'text-success-600 font-medium' : 'text-danger-600 font-medium'">
            {{ isPositiveMovement(row.Bewegungstyp) ? '+' : '-' }}{{ Number(value).toFixed(2) }}
          </span>
        </template>

        <template #cell-Referenz="{ row }">
          <div class="text-sm text-secondary-600">
            <span v-if="row.Referenznummer" class="font-mono">{{ row.Referenznummer }}</span>
            <span v-else>-</span>
          </div>
        </template>

        <template #cell-Benutzer="{ row }">
          <span class="text-sm text-secondary-600">
            {{ row.Benutzer ? `${row.Benutzer.Vorname} ${row.Benutzer.Nachname}` : 'System' }}
          </span>
        </template>
      </DataTable>
    </div>

    <!-- Create Movement Modal -->
    <Modal v-model="showCreateModal" :title="$t('lagerbewegungen.newMovement', 'Neue Lagerbewegung')" size="md">
      <form @submit.prevent="createBewegung" class="space-y-4">
        <div>
          <label class="block text-secondary-700 font-medium mb-2">
            {{ $t('lagerbewegungen.movementType', 'Bewegungstyp') }} *
          </label>
          <select v-model="newBewegung.Bewegungstyp" class="input" required>
            <option value="">{{ $t('common.select', 'Bitte wahlen...') }}</option>
            <option value="Eingang">{{ $t('lagerbewegungen.type.incoming', 'Eingang') }}</option>
            <option value="Ausgang">{{ $t('lagerbewegungen.type.outgoing', 'Ausgang') }}</option>
            <option value="Korrektur_Plus">{{ $t('lagerbewegungen.type.correctionPlus', 'Korrektur +') }}</option>
            <option value="Korrektur_Minus">{{ $t('lagerbewegungen.type.correctionMinus', 'Korrektur -') }}</option>
          </select>
        </div>

        <div>
          <label class="block text-secondary-700 font-medium mb-2">
            {{ $t('lagerbewegungen.stockEntry', 'Bestandseintrag') }} *
          </label>
          <select v-model="newBewegung.BestandID" class="input" required>
            <option value="">{{ $t('common.select', 'Bitte wahlen...') }}</option>
            <option v-for="b in bestandList" :key="b.BestandID" :value="b.BestandID">
              {{ b.Produkte?.Produktname }} - {{ b.Standorte?.Name }} ({{ Number(b.Menge).toFixed(2) }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-secondary-700 font-medium mb-2">
            {{ $t('lagerbewegungen.quantity', 'Menge') }} *
          </label>
          <input
            v-model.number="newBewegung.Menge"
            type="number"
            min="0.01"
            step="0.01"
            class="input"
            required
          />
        </div>

        <div>
          <label class="block text-secondary-700 font-medium mb-2">
            {{ $t('lagerbewegungen.comment', 'Kommentar') }}
          </label>
          <textarea
            v-model="newBewegung.Kommentar"
            class="input min-h-20"
            rows="2"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button variant="secondary" @click="showCreateModal = false">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button :loading="creating" @click="createBewegung">
            {{ $t('common.create', 'Erstellen') }}
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
  { label: t('menu.stockMovements', 'Lagerbewegungen'), to: '/lagerbewegungen' }
])

const columns = [
  { key: 'Bewegungsdatum', label: t('lagerbewegungen.date', 'Datum'), sortable: true },
  { key: 'Produkt', label: t('lagerbewegungen.product', 'Produkt / Standort'), sortable: false },
  { key: 'Bewegungstyp', label: t('lagerbewegungen.type', 'Typ'), sortable: true },
  { key: 'Menge', label: t('lagerbewegungen.quantity', 'Menge'), sortable: true, align: 'right' as const },
  { key: 'Referenz', label: t('lagerbewegungen.reference', 'Referenz'), sortable: false },
  { key: 'Benutzer', label: t('lagerbewegungen.user', 'Benutzer'), sortable: false }
]

const bewegungen = ref<any[]>([])
const bestandList = ref<any[]>([])
const loading = ref(true)
const typFilter = ref('')
const showCreateModal = ref(false)
const creating = ref(false)

const newBewegung = ref({
  BestandID: '',
  Bewegungstyp: '',
  Menge: 1,
  Kommentar: ''
})

async function fetchBewegungen() {
  try {
    loading.value = true
    let url = '/api/lagerbewegungen?limit=200'
    if (typFilter.value) {
      url += `&typ=${typFilter.value}`
    }
    const response = await $fetch(url)
    bewegungen.value = Array.isArray(response) ? response : []
  } catch (err) {
    toast.error(t('lagerbewegungen.errorLoading', 'Fehler beim Laden der Lagerbewegungen'))
    console.error('Fetch Lagerbewegungen Error:', err)
    bewegungen.value = []
  } finally {
    loading.value = false
  }
}

async function fetchBestandList() {
  try {
    const response = await $fetch('/api/berichte/lagerbestand')
    // The lagerbestand API returns aggregated data, we need to get individual stock entries
    // Let's use a simpler approach
    const bestandResponse = await $fetch('/api/berichte/lagerbestand')
    if (bestandResponse?.stockByLocation) {
      // Use direct Prisma query through the bewegungen API
      bestandList.value = bewegungen.value.reduce((list: any[], b: any) => {
        if (b.Bestand && !list.find(x => x.BestandID === b.Bestand.BestandID)) {
          list.push(b.Bestand)
        }
        return list
      }, [])
    }
  } catch (err) {
    console.error('Fetch Bestand Error:', err)
  }
}

async function createBewegung() {
  if (!newBewegung.value.BestandID || !newBewegung.value.Bewegungstyp || !newBewegung.value.Menge) {
    toast.error(t('lagerbewegungen.fillRequired', 'Bitte alle Pflichtfelder ausfullen'))
    return
  }

  try {
    creating.value = true
    await $fetch('/api/lagerbewegungen', {
      method: 'POST',
      body: {
        BestandID: parseInt(newBewegung.value.BestandID as string),
        Bewegungstyp: newBewegung.value.Bewegungstyp,
        Menge: newBewegung.value.Menge,
        Kommentar: newBewegung.value.Kommentar || null
      }
    })
    toast.success(t('lagerbewegungen.createSuccess', 'Lagerbewegung erfolgreich erstellt'))
    showCreateModal.value = false
    newBewegung.value = { BestandID: '', Bewegungstyp: '', Menge: 1, Kommentar: '' }
    fetchBewegungen()
  } catch (err: any) {
    toast.error(t('lagerbewegungen.errorCreating', 'Fehler beim Erstellen der Lagerbewegung'))
    console.error('Create Lagerbewegung Error:', err)
  } finally {
    creating.value = false
  }
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

function formatMovementType(type: string): string {
  const map: Record<string, string> = {
    'Eingang': 'Eingang',
    'Ausgang': 'Ausgang',
    'Umbuchung': 'Umbuchung',
    'Inventur': 'Inventur',
    'Korrektur_Plus': 'Korrektur +',
    'Korrektur_Minus': 'Korrektur -'
  }
  return map[type] || type
}

function isPositiveMovement(type: string): boolean {
  return ['Eingang', 'Zugang', 'Korrektur_Plus'].includes(type)
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
    case 'Korrektur_Plus':
      return `${baseClass} badge-success`
    case 'Korrektur_Minus':
      return `${baseClass} badge-danger`
    default:
      return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(async () => {
  await fetchBewegungen()
  await fetchBestandList()
})
</script>
