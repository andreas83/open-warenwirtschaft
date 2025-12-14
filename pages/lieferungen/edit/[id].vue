<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div v-if="loading" class="card p-12 text-center text-secondary-500">
      <span class="i-mdi-loading animate-spin w-8 h-8 mx-auto mb-4"></span>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <div v-else-if="error" class="card p-12 text-center text-danger-600">
      <span class="i-mdi-alert-circle w-8 h-8 mx-auto mb-4"></span>
      <p>{{ error }}</p>
      <Button variant="secondary" class="mt-4" @click="navigateTo('/lieferungen')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ lieferung.Liefernummer }}</h1>
          <p class="text-secondary-500">{{ $t('lieferungen.editDelivery', 'Lieferung bearbeiten') }}</p>
        </div>
        <span :class="getStatusBadgeClass(lieferung.Status)" class="text-base">
          {{ formatStatus(lieferung.Status) }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Info (read-only) -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.order', 'Bestellung') }}</h2>
            <div class="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
              <div class="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full">
                <span class="i-mdi-clipboard-list text-2xl"></span>
              </div>
              <div>
                <p class="font-medium text-secondary-900">{{ lieferung.Bestellungen?.Bestellnummer }}</p>
                <p class="text-sm text-secondary-500">{{ lieferung.Bestellungen?.Kunden?.Firmenname || lieferung.Bestellungen?.Kunden?.Vorname + ' ' + lieferung.Bestellungen?.Kunden?.Nachname }}</p>
              </div>
            </div>
          </div>

          <!-- Delivery Details -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.details', 'Lieferdetails') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.plannedDate', 'Geplantes Lieferdatum') }}</label>
                <input v-model="formattedGeplantesLieferdatum" type="date" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.actualDate', 'Lieferdatum') }}</label>
                <input v-model="formattedLieferdatum" type="date" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.carrier', 'Spediteur / Lieferant') }}</label>
                <input v-model="lieferung.Lieferant" type="text" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.tracking', 'Tracking-Nummer') }}</label>
                <input v-model="lieferung.TrackingNummer" type="text" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.tour', 'Tour') }}</label>
                <select v-model="lieferung.TourID" class="input">
                  <option :value="null">{{ $t('lieferungen.noTour', 'Keine Tour') }}</option>
                  <option v-for="tour in touren" :key="tour.TourID" :value="tour.TourID">
                    {{ tour.Tournummer }} - {{ tour.Tourbezeichnung }}
                  </option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('lieferungen.comments', 'Kommentare') }}</label>
                <textarea v-model="lieferung.Kommentare" class="input min-h-20" rows="3" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.status', 'Status') }}</h2>
            <select v-model="lieferung.Status" class="input">
              <option value="Geplant">{{ $t('lieferungen.status.planned', 'Geplant') }}</option>
              <option value="In_Auslieferung">{{ $t('lieferungen.status.inProgress', 'In Auslieferung') }}</option>
              <option value="Geliefert">{{ $t('lieferungen.status.delivered', 'Geliefert') }}</option>
              <option value="Fehlgeschlagen">{{ $t('lieferungen.status.failed', 'Fehlgeschlagen') }}</option>
              <option value="Storniert">{{ $t('lieferungen.status.cancelled', 'Storniert') }}</option>
            </select>
          </div>

          <!-- Summary -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.info', 'Informationen') }}</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('lieferungen.deliveryNumber', 'Liefernr.') }}</span>
                <span class="font-medium text-secondary-900">{{ lieferung.Liefernummer }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('lieferungen.created', 'Erstellt') }}</span>
                <span class="text-secondary-900">{{ formatDate(lieferung.Erstelldatum) }}</span>
              </div>
              <div v-if="lieferung.LetzteAenderung" class="flex justify-between">
                <span class="text-secondary-600">{{ $t('lieferungen.lastUpdate', 'Letzte Anderung') }}</span>
                <span class="text-secondary-900">{{ formatDate(lieferung.LetzteAenderung) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <Button :loading="saving" @click="saveLieferung">
              {{ $t('common.save', 'Speichern') }}
            </Button>
            <Button variant="secondary" @click="navigateTo('/lieferungen')">
              {{ $t('common.cancel', 'Abbrechen') }}
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()
const route = useRoute()

const id = computed(() => parseInt(route.params.id as string))

const lieferung = ref<any>({})
const touren = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { label: t('menu.deliveries', 'Lieferungen'), to: '/lieferungen' },
  { label: lieferung.value?.Liefernummer || t('lieferungen.editDelivery', 'Bearbeiten') }
])

const formattedGeplantesLieferdatum = computed({
  get: () => lieferung.value.GeplantesLieferdatum ? new Date(lieferung.value.GeplantesLieferdatum).toISOString().split('T')[0] : '',
  set: (val) => { lieferung.value.GeplantesLieferdatum = val }
})

const formattedLieferdatum = computed({
  get: () => lieferung.value.Lieferdatum ? new Date(lieferung.value.Lieferdatum).toISOString().split('T')[0] : '',
  set: (val) => { lieferung.value.Lieferdatum = val }
})

async function fetchLieferung() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/lieferungen?id=${id.value}`)
    if (!response || response.status === 404) {
      error.value = t('lieferungen.notFound', 'Lieferung nicht gefunden')
      return
    }
    lieferung.value = response
  } catch (err: any) {
    error.value = t('lieferungen.errorLoading', 'Fehler beim Laden der Lieferung')
    console.error('Fetch Lieferung Error:', err)
  } finally {
    loading.value = false
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

async function saveLieferung() {
  try {
    saving.value = true
    await $fetch(`/api/lieferungen?id=${id.value}`, {
      method: 'PUT',
      body: {
        geplantesLieferdatum: formattedGeplantesLieferdatum.value || null,
        lieferdatum: formattedLieferdatum.value || null,
        lieferant: lieferung.value.Lieferant,
        trackingNummer: lieferung.value.TrackingNummer,
        tourId: lieferung.value.TourID,
        status: lieferung.value.Status,
        kommentare: lieferung.value.Kommentare
      }
    })
    toast.success(t('lieferungen.saveSuccess', 'Lieferung erfolgreich gespeichert'))
    navigateTo('/lieferungen')
  } catch (err: any) {
    toast.error(t('lieferungen.errorSaving', 'Fehler beim Speichern der Lieferung'))
    console.error('Save Lieferung Error:', err)
  } finally {
    saving.value = false
  }
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Geplant': 'Geplant',
    'In_Auslieferung': 'In Auslieferung',
    'Geliefert': 'Geliefert',
    'Fehlgeschlagen': 'Fehlgeschlagen',
    'Storniert': 'Storniert'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Geplant': return `${baseClass} badge-info`
    case 'In_Auslieferung': return `${baseClass} badge-warning`
    case 'Geliefert': return `${baseClass} badge-success`
    case 'Fehlgeschlagen': return `${baseClass} badge-danger`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(async () => {
  await Promise.all([fetchLieferung(), fetchTouren()])
})
</script>
