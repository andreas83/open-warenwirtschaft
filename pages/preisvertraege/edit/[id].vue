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
      <Button variant="secondary" class="mt-4" @click="navigateTo('/preisvertraege')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ vertrag.Vertragsnummer }}</h1>
          <p class="text-secondary-500">{{ $t('preisvertraege.editContract', 'Vertrag bearbeiten') }}</p>
        </div>
        <span :class="getStatusBadgeClass(vertrag.Status)" class="text-base">
          {{ formatStatus(vertrag.Status) }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Info (read-only) -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.customer', 'Kunde') }}</h2>
            <div class="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
              <div class="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full">
                <span class="i-mdi-account-circle text-2xl"></span>
              </div>
              <div>
                <p class="font-medium text-secondary-900">{{ vertrag.Kunden?.Firmenname || vertrag.Kunden?.Vorname + ' ' + vertrag.Kunden?.Nachname }}</p>
                <p class="text-sm text-secondary-500">{{ vertrag.Kunden?.Email }}</p>
              </div>
            </div>
          </div>

          <!-- Contract Details -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.details', 'Vertragsdetails') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.title', 'Vertragsbezeichnung') }} *</label>
                <input v-model="vertrag.Vertragsbezeichnung" type="text" class="input" required />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.validFrom', 'Gultig ab') }} *</label>
                <input v-model="formattedGueltigAb" type="date" class="input" required />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.validUntil', 'Gultig bis') }}</label>
                <input v-model="formattedGueltigBis" type="date" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.minimumOrder', 'Mindestabnahme') }}</label>
                <input v-model.number="vertrag.Mindestabnahme" type="number" min="0" step="0.01" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.paymentTerms', 'Zahlungsbedingungen') }}</label>
                <input v-model="vertrag.Zahlungsbedingungen" type="text" class="input" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.description', 'Beschreibung') }}</label>
                <textarea v-model="vertrag.Beschreibung" class="input min-h-20" rows="2" />
              </div>
            </div>
          </div>

          <!-- Contract Positions -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.positions', 'Vertragspositionen') }}</h2>

            <div v-if="!vertrag.Vertragspositionen?.length" class="text-center py-8 text-secondary-500">
              {{ $t('preisvertraege.noPositions', 'Keine Positionen') }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="pos in vertrag.Vertragspositionen"
                :key="pos.VertragspositionID"
                class="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
              >
                <div class="flex-1">
                  <div class="font-medium text-secondary-900">{{ pos.Produkte?.Produktname }}</div>
                  <div class="text-sm text-secondary-500">
                    {{ $t('preisvertraege.fromQuantity', 'Ab Menge') }}: {{ pos.MengeAb }}
                    <span v-if="pos.MengeBis"> - {{ pos.MengeBis }}</span>
                  </div>
                </div>
                <div class="font-medium text-primary-600">
                  {{ formatCurrency(pos.Vertragspreis) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.notes', 'Kommentare') }}</h2>
            <textarea v-model="vertrag.Kommentare" class="input min-h-20" rows="3" />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.status', 'Status') }}</h2>
            <select v-model="vertrag.Status" class="input">
              <option value="Aktiv">{{ $t('preisvertraege.status.active', 'Aktiv') }}</option>
              <option value="Inaktiv">{{ $t('preisvertraege.status.inactive', 'Inaktiv') }}</option>
              <option value="Abgelaufen">{{ $t('preisvertraege.status.expired', 'Abgelaufen') }}</option>
              <option value="Gekuendigt">{{ $t('preisvertraege.status.cancelled', 'Gekundigt') }}</option>
            </select>
          </div>

          <!-- Summary -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.summary', 'Zusammenfassung') }}</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('preisvertraege.contractNumber', 'Vertragsnr.') }}</span>
                <span class="font-medium text-secondary-900">{{ vertrag.Vertragsnummer }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('preisvertraege.positions', 'Positionen') }}</span>
                <span class="text-secondary-900">{{ vertrag.Vertragspositionen?.length || 0 }}</span>
              </div>
              <div v-if="vertrag.Mindestabnahme" class="flex justify-between">
                <span class="text-secondary-600">{{ $t('preisvertraege.minimumOrder', 'Mindestabnahme') }}</span>
                <span class="text-secondary-900">{{ formatCurrency(vertrag.Mindestabnahme) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('preisvertraege.created', 'Erstellt') }}</span>
                <span class="text-secondary-900">{{ formatDate(vertrag.Erstelldatum) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <Button :loading="saving" @click="saveVertrag">
              {{ $t('common.save', 'Speichern') }}
            </Button>
            <Button variant="secondary" @click="navigateTo('/preisvertraege')">
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

const vertrag = ref<any>({})
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { label: t('menu.priceContracts', 'Preisvertrage'), to: '/preisvertraege' },
  { label: vertrag.value?.Vertragsnummer || t('preisvertraege.editContract', 'Bearbeiten') }
])

const formattedGueltigAb = computed({
  get: () => vertrag.value.GueltigAb ? new Date(vertrag.value.GueltigAb).toISOString().split('T')[0] : '',
  set: (val) => { vertrag.value.GueltigAb = val }
})

const formattedGueltigBis = computed({
  get: () => vertrag.value.GueltigBis ? new Date(vertrag.value.GueltigBis).toISOString().split('T')[0] : '',
  set: (val) => { vertrag.value.GueltigBis = val }
})

async function fetchVertrag() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/preisvertraege?id=${id.value}`)
    if (!response || response.status === 404) {
      error.value = t('preisvertraege.notFound', 'Vertrag nicht gefunden')
      return
    }
    vertrag.value = response
  } catch (err: any) {
    error.value = t('preisvertraege.errorLoading', 'Fehler beim Laden des Vertrags')
    console.error('Fetch Vertrag Error:', err)
  } finally {
    loading.value = false
  }
}

async function saveVertrag() {
  try {
    saving.value = true
    await $fetch(`/api/preisvertraege?id=${id.value}`, {
      method: 'PUT',
      body: {
        kundenId: vertrag.value.KundenID,
        vertragsbezeichnung: vertrag.value.Vertragsbezeichnung,
        beschreibung: vertrag.value.Beschreibung,
        gueltigAb: formattedGueltigAb.value,
        gueltigBis: formattedGueltigBis.value || null,
        status: vertrag.value.Status,
        zahlungsbedingungen: vertrag.value.Zahlungsbedingungen,
        mindestabnahme: vertrag.value.Mindestabnahme,
        kommentare: vertrag.value.Kommentare
      }
    })
    toast.success(t('preisvertraege.saveSuccess', 'Vertrag erfolgreich gespeichert'))
    navigateTo('/preisvertraege')
  } catch (err: any) {
    toast.error(t('preisvertraege.errorSaving', 'Fehler beim Speichern des Vertrags'))
    console.error('Save Vertrag Error:', err)
  } finally {
    saving.value = false
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

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Aktiv': 'Aktiv',
    'Inaktiv': 'Inaktiv',
    'Abgelaufen': 'Abgelaufen',
    'Gekuendigt': 'Gekundigt'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Aktiv': return `${baseClass} badge-success`
    case 'Inaktiv': return `${baseClass} badge-warning`
    case 'Abgelaufen': return `${baseClass} bg-secondary-100 text-secondary-700`
    case 'Gekuendigt': return `${baseClass} badge-danger`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchVertrag()
})
</script>
