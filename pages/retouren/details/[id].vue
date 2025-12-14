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
      <Button variant="secondary" class="mt-4" @click="navigateTo('/retouren')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ retoure.Retourennummer }}</h1>
          <p class="text-secondary-500">{{ formatDate(retoure.Retourendatum) }}</p>
        </div>
        <div class="flex gap-2">
          <select v-model="retoure.Status" class="input" @change="updateStatus">
            <option value="Offen">{{ $t('retouren.status.open', 'Offen') }}</option>
            <option value="In_Bearbeitung">{{ $t('retouren.status.processing', 'In Bearbeitung') }}</option>
            <option value="Abgeschlossen">{{ $t('retouren.status.completed', 'Abgeschlossen') }}</option>
            <option value="Storniert">{{ $t('retouren.status.cancelled', 'Storniert') }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Return Items -->
          <div class="card">
            <div class="p-4 border-b border-secondary-200">
              <h2 class="text-lg font-semibold text-secondary-800">{{ $t('retouren.items', 'Positionen') }}</h2>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-secondary-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-secondary-600">{{ $t('retouren.product', 'Produkt') }}</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-secondary-600">{{ $t('retouren.quantity', 'Menge') }}</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-secondary-600">{{ $t('retouren.unitPrice', 'Einzelpreis') }}</th>
                    <th class="px-4 py-3 text-right text-sm font-medium text-secondary-600">{{ $t('retouren.total', 'Gesamt') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-secondary-100">
                  <tr v-for="pos in retoure.Retourenpositionen" :key="pos.RetourenpositionsID" class="hover:bg-secondary-50">
                    <td class="px-4 py-3">
                      <div class="font-medium text-secondary-900">{{ pos.Produkte?.Produktname || 'Unbekannt' }}</div>
                    </td>
                    <td class="px-4 py-3 text-right text-secondary-900">
                      {{ Number(pos.Menge) }} {{ pos.Produkte?.Einheiten?.Symbol || '' }}
                    </td>
                    <td class="px-4 py-3 text-right text-secondary-900">{{ formatCurrency(pos.EinzelpreisNetto) }}</td>
                    <td class="px-4 py-3 text-right font-medium text-secondary-900">{{ formatCurrency(pos.GesamtpreisNetto) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Reason -->
          <div v-if="retoure.Ruecksendegrund" class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-2">{{ $t('retouren.reason', 'Rucksendegrund') }}</h2>
            <p class="text-secondary-600 whitespace-pre-wrap">{{ retoure.Ruecksendegrund }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('retouren.status', 'Status') }}</h2>
            <span :class="getStatusBadgeClass(retoure.Status)" class="text-base">
              {{ formatStatus(retoure.Status) }}
            </span>
          </div>

          <!-- Customer -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('retouren.customer', 'Kunde') }}</h2>
            <div v-if="retoure.Kunden">
              <p class="font-medium text-secondary-900">{{ getKundenName(retoure.Kunden) }}</p>
              <p v-if="retoure.Kunden.Email" class="text-sm text-primary-600 mt-2">{{ retoure.Kunden.Email }}</p>
              <p v-if="retoure.Kunden.Telefon" class="text-sm text-secondary-600">{{ retoure.Kunden.Telefon }}</p>
            </div>
          </div>

          <!-- Related Order -->
          <div v-if="retoure.Bestellungen" class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('retouren.relatedOrder', 'Zugehorige Bestellung') }}</h2>
            <NuxtLink
              :to="`/bestellungen/details/${retoure.BestellID}`"
              class="text-primary-600 hover:underline font-medium"
            >
              {{ retoure.Bestellungen.Bestellnummer }}
            </NuxtLink>
          </div>

          <!-- Summary -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('retouren.summary', 'Zusammenfassung') }}</h2>
            <div class="space-y-2 text-sm">
              <div class="border-t border-secondary-200 pt-2">
                <div class="flex justify-between font-medium">
                  <span class="text-secondary-800">{{ $t('retouren.totalCredit', 'Gutschriftbetrag') }}</span>
                  <span class="text-lg text-success-600">{{ formatCurrency(retoure.GesamtbetragGutschrift) }}</span>
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

const retoure = ref<any>({})
const loading = ref(true)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { label: t('menu.returns', 'Retouren'), to: '/retouren' },
  { label: retoure.value?.Retourennummer || t('retouren.details', 'Details') }
])

async function fetchRetoure() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/retouren?id=${id.value}`)
    if (response?.status === 404) {
      error.value = t('retouren.notFound', 'Retoure nicht gefunden')
      return
    }
    retoure.value = response
  } catch (err: any) {
    error.value = t('retouren.errorLoading', 'Fehler beim Laden der Retoure')
    console.error('Fetch Retoure Error:', err)
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  try {
    await $fetch(`/api/retouren?id=${id.value}`, {
      method: 'PUT',
      body: {
        Status: retoure.value.Status,
        GesamtbetragGutschrift: retoure.value.GesamtbetragGutschrift
      }
    })
    toast.success(t('retouren.statusUpdated', 'Status aktualisiert'))
  } catch (err) {
    toast.error(t('retouren.errorUpdating', 'Fehler beim Aktualisieren'))
    console.error('Update Status Error:', err)
  }
}

function getKundenName(kunde: any): string {
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
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchRetoure()
})
</script>
