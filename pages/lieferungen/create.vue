<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('lieferungen.newDelivery', 'Neue Lieferung') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Order Selection -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.order', 'Bestellung') }}</h2>
          <div>
            <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.selectOrder', 'Bestellung auswahlen') }} *</label>
            <AsyncAutocomplete
              v-model="selectedBestellung"
              :items="bestellungen"
              :loading="bestellungenLoading"
              :display-fn="(b) => b?.Bestellnummer || ''"
              item-key="BestellID"
              :placeholder="$t('lieferungen.searchOrder', 'Bestellung suchen...')"
              @search="handleBestellungSearch"
            />
          </div>

          <div v-if="selectedBestellung" class="mt-4 p-4 bg-secondary-50 rounded-lg">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-secondary-900">{{ selectedBestellung.Bestellnummer }}</p>
                <p class="text-sm text-secondary-500">{{ selectedBestellung.Kunden?.Firmenname || selectedBestellung.Kunden?.Vorname + ' ' + selectedBestellung.Kunden?.Nachname }}</p>
              </div>
              <span :class="getOrderStatusBadge(selectedBestellung.Status)">{{ selectedBestellung.Status }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Details -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.details', 'Lieferdetails') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.plannedDate', 'Geplantes Lieferdatum') }}</label>
              <input v-model="lieferung.geplantesLieferdatum" type="date" class="input" />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.carrier', 'Spediteur / Lieferant') }}</label>
              <input v-model="lieferung.lieferant" type="text" class="input" />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.tracking', 'Tracking-Nummer') }}</label>
              <input v-model="lieferung.trackingNummer" type="text" class="input" />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.tour', 'Tour') }}</label>
              <select v-model="lieferung.tourId" class="input">
                <option :value="null">{{ $t('lieferungen.noTour', 'Keine Tour') }}</option>
                <option v-for="tour in touren" :key="tour.TourID" :value="tour.TourID">
                  {{ tour.Tournummer }} - {{ tour.Tourbezeichnung }}
                </option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.comments', 'Kommentare') }}</label>
              <textarea v-model="lieferung.kommentare" class="input min-h-20" rows="2" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.status', 'Status') }}</h2>
          <select v-model="lieferung.status" class="input">
            <option value="Geplant">{{ $t('lieferungen.status.planned', 'Geplant') }}</option>
            <option value="In_Auslieferung">{{ $t('lieferungen.status.inProgress', 'In Auslieferung') }}</option>
          </select>
        </div>

        <!-- Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.summary', 'Zusammenfassung') }}</h2>
          <div class="space-y-2 text-sm">
            <div v-if="selectedBestellung" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('lieferungen.order', 'Bestellung') }}</span>
              <span class="font-medium text-secondary-900">{{ selectedBestellung.Bestellnummer }}</span>
            </div>
            <div v-if="lieferung.geplantesLieferdatum" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('lieferungen.plannedDate', 'Geplant') }}</span>
              <span class="text-secondary-900">{{ formatDate(lieferung.geplantesLieferdatum) }}</span>
            </div>
            <div v-if="lieferung.lieferant" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('lieferungen.carrier', 'Spediteur') }}</span>
              <span class="text-secondary-900">{{ lieferung.lieferant }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!canSave" @click="saveLieferung">
            {{ $t('lieferungen.createDelivery', 'Lieferung erstellen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/lieferungen')">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.deliveries', 'Lieferungen'), to: '/lieferungen' },
  { label: t('lieferungen.newDelivery', 'Neue Lieferung') }
])

const lieferung = ref({
  geplantesLieferdatum: '',
  lieferant: '',
  trackingNummer: '',
  tourId: null as number | null,
  status: 'Geplant',
  kommentare: ''
})

const selectedBestellung = ref<any>(null)
const bestellungen = ref<any[]>([])
const bestellungenLoading = ref(false)
const touren = ref<any[]>([])
const saving = ref(false)

const canSave = computed(() => {
  return selectedBestellung.value
})

async function handleBestellungSearch(query: string) {
  if (!query) {
    bestellungen.value = []
    return
  }
  try {
    bestellungenLoading.value = true
    const response = await $fetch(`/api/bestellungen?limit=20&search=${encodeURIComponent(query)}`)
    bestellungen.value = response?.orders || []
  } catch (err) {
    console.error('Fetch Bestellungen Error:', err)
    bestellungen.value = []
  } finally {
    bestellungenLoading.value = false
  }
}

async function fetchTouren() {
  try {
    const response = await $fetch('/api/lieferungen?type=touren')
    touren.value = response?.tours || []
  } catch (err) {
    console.error('Fetch Touren Error:', err)
  }
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
}

function getOrderStatusBadge(status: string): string {
  const baseClass = 'badge text-xs'
  switch (status) {
    case 'Bestaetigt': return `${baseClass} badge-success`
    case 'In_Bearbeitung': return `${baseClass} badge-info`
    case 'Versendet': return `${baseClass} badge-primary`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

async function saveLieferung() {
  if (!canSave.value) return

  try {
    saving.value = true
    await $fetch('/api/lieferungen', {
      method: 'POST',
      body: {
        bestellId: selectedBestellung.value.BestellID,
        geplantesLieferdatum: lieferung.value.geplantesLieferdatum || null,
        lieferant: lieferung.value.lieferant || null,
        trackingNummer: lieferung.value.trackingNummer || null,
        tourId: lieferung.value.tourId,
        status: lieferung.value.status,
        kommentare: lieferung.value.kommentare || null
      }
    })
    toast.success(t('lieferungen.createSuccess', 'Lieferung erfolgreich erstellt'))
    navigateTo('/lieferungen')
  } catch (err: any) {
    toast.error(t('lieferungen.errorCreating', 'Fehler beim Erstellen der Lieferung'))
    console.error('Create Lieferung Error:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchTouren()
})
</script>
