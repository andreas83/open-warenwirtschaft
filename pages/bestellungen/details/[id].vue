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
      <Button variant="secondary" class="mt-4" @click="navigateTo('/bestellungen')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ bestellung.Bestellnummer }}</h1>
          <p class="text-secondary-500">{{ formatDate(bestellung.Bestelldatum) }}</p>
        </div>
        <div class="flex gap-2">
          <Button variant="secondary" icon="i-mdi-pencil" @click="navigateTo(`/bestellungen/edit/${bestellung.BestellID}`)">
            {{ $t('common.edit', 'Bearbeiten') }}
          </Button>
          <select v-model="bestellung.Bestellstatus" class="input" @change="updateStatus">
            <option value="Offen">{{ $t('bestellungen.status.open', 'Offen') }}</option>
            <option value="In_Bearbeitung">{{ $t('bestellungen.status.processing', 'In Bearbeitung') }}</option>
            <option value="Versendet">{{ $t('bestellungen.status.shipped', 'Versendet') }}</option>
            <option value="Abgeschlossen">{{ $t('bestellungen.status.completed', 'Abgeschlossen') }}</option>
            <option value="Storniert">{{ $t('bestellungen.status.cancelled', 'Storniert') }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <div class="card">
            <div class="p-4 border-b border-secondary-200">
              <h2 class="text-lg font-semibold text-secondary-800">{{ $t('bestellungen.items', 'Positionen') }}</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-secondary-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-secondary-600">{{ $t('bestellungen.product', 'Produkt') }}</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-secondary-600">{{ $t('bestellungen.quantity', 'Menge') }}</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-secondary-600">{{ $t('bestellungen.unitPrice', 'Einzelpreis') }}</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-secondary-600">{{ $t('bestellungen.vat', 'MwSt.') }}</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-secondary-600">{{ $t('bestellungen.total', 'Gesamt') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-secondary-100">
                  <tr v-for="pos in bestellung.Bestellpositionen" :key="pos.BestellpositionsID" class="hover:bg-secondary-50">
                    <td class="px-4 py-3">
                      <div class="font-medium text-secondary-900">{{ pos.Produkte?.Produktname || 'Unbekannt' }}</div>
                      <div v-if="pos.Beschreibung" class="text-sm text-secondary-500">{{ pos.Beschreibung }}</div>
                    </td>
                    <td class="px-4 py-3 text-right text-secondary-900">
                      {{ Number(pos.Menge) }} {{ pos.Produkte?.Einheiten?.Symbol || '' }}
                    </td>
                    <td class="px-4 py-3 text-right text-secondary-900">{{ formatCurrency(pos.EinzelpreisNetto) }}</td>
                    <td class="px-4 py-3 text-right text-secondary-500">{{ pos.MwSt_Satz || 19 }}%</td>
                    <td class="px-4 py-3 text-right font-medium text-secondary-900">{{ formatCurrency(pos.GesamtpreisNettoPosition) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Comments -->
          <div v-if="bestellung.Kommentare" class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-2">{{ $t('bestellungen.comments', 'Kommentare') }}</h2>
            <p class="text-secondary-600 whitespace-pre-wrap">{{ bestellung.Kommentare }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('bestellungen.status', 'Status') }}</h2>
            <span :class="getStatusBadgeClass(bestellung.Bestellstatus)" class="text-base">
              {{ formatStatus(bestellung.Bestellstatus) }}
            </span>
          </div>

          <!-- Customer -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('bestellungen.customer', 'Kunde') }}</h2>
            <div v-if="bestellung.Kunden">
              <p class="font-medium text-secondary-900">{{ getKundeDisplayName(bestellung.Kunden) }}</p>
              <p v-if="bestellung.Kunden.Adresse" class="text-sm text-secondary-600 mt-1">{{ bestellung.Kunden.Adresse }}</p>
              <p v-if="bestellung.Kunden.PLZ || bestellung.Kunden.Ort" class="text-sm text-secondary-600">
                {{ bestellung.Kunden.PLZ }} {{ bestellung.Kunden.Ort }}
              </p>
              <p v-if="bestellung.Kunden.Email" class="text-sm text-primary-600 mt-2">{{ bestellung.Kunden.Email }}</p>
              <p v-if="bestellung.Kunden.Telefon" class="text-sm text-secondary-600">{{ bestellung.Kunden.Telefon }}</p>
            </div>
          </div>

          <!-- Delivery Info -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('bestellungen.delivery', 'Lieferung') }}</h2>
            <div class="space-y-2 text-sm">
              <div v-if="bestellung.Lieferdatum">
                <span class="text-secondary-500">{{ $t('bestellungen.deliveryDate', 'Lieferdatum') }}:</span>
                <span class="ml-2 text-secondary-900">{{ formatDate(bestellung.Lieferdatum) }}</span>
              </div>
              <div v-if="bestellung.Standorte">
                <span class="text-secondary-500">{{ $t('bestellungen.location', 'Standort') }}:</span>
                <span class="ml-2 text-secondary-900">{{ bestellung.Standorte.Name }}</span>
              </div>
              <div v-if="bestellung.Lieferadresse" class="mt-2">
                <span class="text-secondary-500 block">{{ $t('bestellungen.deliveryAddress', 'Lieferadresse') }}:</span>
                <p class="text-secondary-900 whitespace-pre-wrap mt-1">{{ bestellung.Lieferadresse }}</p>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('bestellungen.summary', 'Zusammenfassung') }}</h2>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('bestellungen.subtotal', 'Zwischensumme') }}</span>
                <span class="text-secondary-900">{{ formatCurrency(bestellung.GesamtsummeNetto) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('bestellungen.vat', 'MwSt.') }}</span>
                <span class="text-secondary-900">{{ formatCurrency((bestellung.GesamtsummeBrutto || 0) - (bestellung.GesamtsummeNetto || 0) - (bestellung.Versandkosten || 0)) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-600">{{ $t('bestellungen.shipping', 'Versand') }}</span>
                <span class="text-secondary-900">{{ formatCurrency(bestellung.Versandkosten) }}</span>
              </div>
              <div class="border-t border-secondary-200 pt-2 mt-2">
                <div class="flex justify-between font-medium">
                  <span class="text-secondary-800">{{ $t('bestellungen.grandTotal', 'Gesamtbetrag') }}</span>
                  <span class="text-lg text-primary-600">{{ formatCurrency(bestellung.GesamtsummeBrutto) }}</span>
                </div>
              </div>
            </div>
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

const bestellung = ref<any>({})
const loading = ref(true)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { label: t('menu.orders', 'Bestellungen'), to: '/bestellungen' },
  { label: bestellung.value?.Bestellnummer || t('bestellungen.details', 'Details') }
])

async function fetchBestellung() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/bestellungen?id=${id.value}`)
    if (response?.status === 404) {
      error.value = t('bestellungen.notFound', 'Bestellung nicht gefunden')
      return
    }
    bestellung.value = response
  } catch (err: any) {
    error.value = t('bestellungen.errorLoading', 'Fehler beim Laden der Bestellung')
    console.error('Fetch Bestellung Error:', err)
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  try {
    await $fetch(`/api/bestellungen?id=${id.value}`, {
      method: 'PUT',
      body: {
        ...bestellung.value,
        Bestellstatus: bestellung.value.Bestellstatus
      }
    })
    toast.success(t('bestellungen.statusUpdated', 'Status aktualisiert'))
  } catch (err) {
    toast.error(t('bestellungen.errorUpdating', 'Fehler beim Aktualisieren'))
    console.error('Update Status Error:', err)
  }
}

function getKundeDisplayName(kunde: any): string {
  if (!kunde) return ''
  if (kunde.Firmenname) return kunde.Firmenname
  return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || 'Unbekannt'
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
    'Offen': 'Offen',
    'In_Bearbeitung': 'In Bearbeitung',
    'Versendet': 'Versendet',
    'Abgeschlossen': 'Abgeschlossen',
    'Storniert': 'Storniert'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Abgeschlossen': return `${baseClass} badge-success`
    case 'Offen': return `${baseClass} badge-warning`
    case 'In_Bearbeitung': return `${baseClass} badge-info`
    case 'Versendet': return `${baseClass} badge-primary`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchBestellung()
})
</script>
