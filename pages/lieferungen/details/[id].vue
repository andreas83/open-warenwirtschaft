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
          <p class="text-secondary-500">{{ formatDateTime(lieferung.Erstelldatum) }}</p>
        </div>
        <span :class="getStatusBadgeClass(lieferung.Status)" class="text-base">
          {{ formatStatus(lieferung.Status) }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Info -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.orderInfo', 'Bestellinformationen') }}</h2>
            <div class="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
              <div class="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full">
                <span class="i-mdi-clipboard-list text-2xl"></span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-secondary-900">{{ lieferung.Bestellungen?.Bestellnummer }}</p>
                <p class="text-sm text-secondary-500">{{ lieferung.Bestellungen?.Kunden?.Firmenname || lieferung.Bestellungen?.Kunden?.Vorname + ' ' + lieferung.Bestellungen?.Kunden?.Nachname }}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="i-mdi-open-in-new"
                @click="navigateTo(`/bestellungen/details/${lieferung.Bestellungen?.BestellID}`)"
              />
            </div>
          </div>

          <!-- Delivery Details -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.details', 'Lieferdetails') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p class="text-sm text-secondary-500 mb-1">{{ $t('lieferungen.plannedDate', 'Geplantes Lieferdatum') }}</p>
                <p class="font-medium text-secondary-900">
                  {{ lieferung.GeplantesLieferdatum ? formatDate(lieferung.GeplantesLieferdatum) : '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-secondary-500 mb-1">{{ $t('lieferungen.actualDate', 'Lieferdatum') }}</p>
                <p class="font-medium text-secondary-900">
                  {{ lieferung.Lieferdatum ? formatDate(lieferung.Lieferdatum) : '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-secondary-500 mb-1">{{ $t('lieferungen.carrier', 'Spediteur') }}</p>
                <p class="font-medium text-secondary-900">{{ lieferung.Lieferant || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-secondary-500 mb-1">{{ $t('lieferungen.tracking', 'Tracking-Nummer') }}</p>
                <p v-if="lieferung.TrackingNummer" class="font-mono text-secondary-900">{{ lieferung.TrackingNummer }}</p>
                <p v-else class="text-secondary-400">-</p>
              </div>
            </div>
          </div>

          <!-- Tour Info -->
          <div v-if="lieferung.Touren" class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.tourInfo', 'Tourinformationen') }}</h2>
            <div class="p-4 bg-secondary-50 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-medium text-secondary-900">{{ lieferung.Touren.Tournummer }}</p>
                  <p class="text-sm text-secondary-500">{{ lieferung.Touren.Tourbezeichnung }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-secondary-500">{{ formatDate(lieferung.Touren.Tourdatum) }}</p>
                  <p v-if="lieferung.Touren.FahrerName" class="text-sm text-secondary-700">{{ lieferung.Touren.FahrerName }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Comments -->
          <div v-if="lieferung.Kommentare" class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.comments', 'Kommentare') }}</h2>
            <p class="text-secondary-700 whitespace-pre-wrap">{{ lieferung.Kommentare }}</p>
          </div>

          <!-- Proof of Delivery -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.proofOfDelivery', 'Liefernachweise') }}</h2>
            <div v-if="!lieferung.Liefernachweise?.length" class="text-center py-8 text-secondary-500">
              {{ $t('lieferungen.noProofs', 'Keine Liefernachweise vorhanden') }}
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="nachweis in lieferung.Liefernachweise"
                :key="nachweis.LiefernachweisID"
                class="p-4 bg-secondary-50 rounded-lg"
              >
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-medium text-secondary-900">{{ nachweis.Nachweistyp }}</p>
                    <p class="text-sm text-secondary-500">{{ formatDateTime(nachweis.Erstelldatum) }}</p>
                  </div>
                  <span class="badge badge-success">{{ $t('lieferungen.confirmed', 'Bestatigt') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Actions -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.actions', 'Aktionen') }}</h2>
            <div class="space-y-3">
              <Button
                v-if="lieferung.Status === 'Geplant'"
                class="w-full"
                icon="i-mdi-truck-delivery"
                :loading="updating"
                @click="updateStatus('In_Auslieferung')"
              >
                {{ $t('lieferungen.startDelivery', 'Auslieferung starten') }}
              </Button>
              <Button
                v-if="lieferung.Status === 'In_Auslieferung'"
                class="w-full"
                variant="success"
                icon="i-mdi-check-circle"
                :loading="updating"
                @click="updateStatus('Geliefert')"
              >
                {{ $t('lieferungen.markDelivered', 'Als geliefert markieren') }}
              </Button>
              <Button
                v-if="lieferung.Status === 'In_Auslieferung'"
                class="w-full"
                variant="danger"
                icon="i-mdi-alert-circle"
                :loading="updating"
                @click="updateStatus('Fehlgeschlagen')"
              >
                {{ $t('lieferungen.markFailed', 'Lieferung fehlgeschlagen') }}
              </Button>
            </div>
          </div>

          <!-- Timeline -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('lieferungen.timeline', 'Zeitverlauf') }}</h2>
            <div class="space-y-4">
              <div class="flex gap-3">
                <div class="w-3 h-3 bg-success-500 rounded-full mt-1.5"></div>
                <div>
                  <p class="text-sm font-medium text-secondary-900">{{ $t('lieferungen.created', 'Erstellt') }}</p>
                  <p class="text-xs text-secondary-500">{{ formatDateTime(lieferung.Erstelldatum) }}</p>
                </div>
              </div>
              <div v-if="lieferung.GeplantesLieferdatum" class="flex gap-3">
                <div class="w-3 h-3 bg-info-500 rounded-full mt-1.5"></div>
                <div>
                  <p class="text-sm font-medium text-secondary-900">{{ $t('lieferungen.planned', 'Geplant') }}</p>
                  <p class="text-xs text-secondary-500">{{ formatDate(lieferung.GeplantesLieferdatum) }}</p>
                </div>
              </div>
              <div v-if="lieferung.Lieferdatum" class="flex gap-3">
                <div class="w-3 h-3 bg-success-500 rounded-full mt-1.5"></div>
                <div>
                  <p class="text-sm font-medium text-secondary-900">{{ $t('lieferungen.delivered', 'Geliefert') }}</p>
                  <p class="text-xs text-secondary-500">{{ formatDate(lieferung.Lieferdatum) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex flex-col gap-3">
            <Button variant="secondary" icon="i-mdi-pencil" @click="navigateTo(`/lieferungen/edit/${id}`)">
              {{ $t('common.edit', 'Bearbeiten') }}
            </Button>
            <Button variant="secondary" @click="navigateTo('/lieferungen')">
              {{ $t('common.back', 'Zuruck zur Liste') }}
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
const loading = ref(true)
const updating = ref(false)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { label: t('menu.deliveries', 'Lieferungen'), to: '/lieferungen' },
  { label: lieferung.value?.Liefernummer || `#${id.value}` }
])

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

async function updateStatus(newStatus: string) {
  try {
    updating.value = true
    const body: any = { status: newStatus }

    // Set delivery date when marking as delivered
    if (newStatus === 'Geliefert') {
      body.lieferdatum = new Date().toISOString()
    }

    await $fetch(`/api/lieferungen?id=${id.value}`, {
      method: 'PUT',
      body
    })
    lieferung.value.Status = newStatus
    if (newStatus === 'Geliefert') {
      lieferung.value.Lieferdatum = new Date().toISOString()
    }
    toast.success(t('lieferungen.statusUpdated', 'Status aktualisiert'))
  } catch (err: any) {
    toast.error(t('lieferungen.errorUpdating', 'Fehler beim Aktualisieren'))
    console.error('Update Status Error:', err)
  } finally {
    updating.value = false
  }
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
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

onMounted(() => {
  fetchLieferung()
})
</script>
