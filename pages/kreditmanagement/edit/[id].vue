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
      <Button variant="secondary" class="mt-4" @click="navigateTo('/kreditmanagement')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ limit.Kunden?.Firmenname || limit.Kunden?.Vorname + ' ' + limit.Kunden?.Nachname }}</h1>
          <p class="text-secondary-500">{{ $t('kreditmanagement.editLimit', 'Kreditlimit bearbeiten') }}</p>
        </div>
        <span v-if="limit.Kreditsperre" class="badge badge-danger text-base">
          {{ $t('kreditmanagement.blocked', 'Gesperrt') }}
        </span>
        <span v-else class="badge badge-success text-base">
          {{ $t('kreditmanagement.active', 'Aktiv') }}
        </span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Info (read-only) -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.customer', 'Kunde') }}</h2>
            <div class="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
              <div class="w-12 h-12 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full">
                <span class="i-mdi-account-circle text-2xl"></span>
              </div>
              <div>
                <p class="font-medium text-secondary-900">{{ limit.Kunden?.Firmenname || limit.Kunden?.Vorname + ' ' + limit.Kunden?.Nachname }}</p>
                <p class="text-sm text-secondary-500">{{ limit.Kunden?.Kundennummer }} - {{ limit.Kunden?.Email }}</p>
              </div>
            </div>
          </div>

          <!-- Credit Details -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.creditDetails', 'Kreditdetails') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.creditLimit', 'Kreditlimit') }} *</label>
                <div class="relative">
                  <input v-model.number="limit.Kreditlimit" type="number" min="0" step="0.01" class="input pr-12" required />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">EUR</span>
                </div>
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.currentDebt', 'Aktuelle Schuld') }}</label>
                <div class="relative">
                  <input v-model.number="limit.AktuelleSchuld" type="number" min="0" step="0.01" class="input pr-12" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">EUR</span>
                </div>
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.paymentTerms', 'Zahlungsziel (Tage)') }}</label>
                <input v-model.number="limit.Zahlungsziel" type="number" min="0" class="input" />
              </div>
            </div>

            <!-- Utilization Bar -->
            <div class="mt-6">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-secondary-600">{{ $t('kreditmanagement.utilization', 'Auslastung') }}</span>
                <span :class="getUtilizationTextClass">{{ utilizationPercent.toFixed(1) }}%</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-3">
                <div
                  :class="['h-3 rounded-full transition-all', getUtilizationBarClass]"
                  :style="{ width: `${Math.min(100, utilizationPercent)}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Credit Block -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.creditBlock', 'Kreditsperre') }}</h2>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <input
                  id="kreditsperre"
                  v-model="limit.Kreditsperre"
                  type="checkbox"
                  class="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label for="kreditsperre" class="text-secondary-700">
                  {{ $t('kreditmanagement.blockCredit', 'Kredit sperren') }}
                </label>
              </div>
              <div v-if="limit.Kreditsperre">
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.blockReason', 'Sperrgrund') }}</label>
                <textarea v-model="limit.Sperrgrund" class="input min-h-20" rows="2" />
              </div>
            </div>
          </div>

          <!-- Reminders History -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.reminderHistory', 'Mahnungen') }}</h2>

            <div v-if="!limit.Mahnungen?.length" class="text-center py-8 text-secondary-500">
              {{ $t('kreditmanagement.noReminders', 'Keine Mahnungen') }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="mahnung in limit.Mahnungen"
                :key="mahnung.MahnungID"
                class="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
              >
                <div>
                  <div class="font-medium text-secondary-900">{{ mahnung.Mahnungsnummer }}</div>
                  <div class="text-sm text-secondary-500">
                    {{ formatDate(mahnung.Mahnungsdatum) }} - {{ $t('kreditmanagement.level', 'Stufe') }} {{ mahnung.Mahnstufe }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-secondary-900">{{ formatCurrency(mahnung.Mahnbetrag) }}</div>
                  <span :class="getReminderStatusBadge(mahnung.Status)">{{ mahnung.Status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Stats -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.statistics', 'Statistik') }}</h2>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-secondary-600">{{ $t('kreditmanagement.availableCredit', 'Verfugbar') }}</span>
                <span class="font-medium text-success-600">{{ formatCurrency(availableCredit) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-secondary-600">{{ $t('kreditmanagement.openReminders', 'Offene Mahnungen') }}</span>
                <span class="font-medium text-secondary-900">{{ openRemindersCount }}</span>
              </div>
              <div v-if="limit.LetztePruefung" class="flex justify-between items-center">
                <span class="text-secondary-600">{{ $t('kreditmanagement.lastReview', 'Letzte Prufung') }}</span>
                <span class="text-secondary-900">{{ formatDate(limit.LetztePruefung) }}</span>
              </div>
              <div v-if="limit.Erstelldatum" class="flex justify-between items-center">
                <span class="text-secondary-600">{{ $t('kreditmanagement.created', 'Erstellt') }}</span>
                <span class="text-secondary-900">{{ formatDate(limit.Erstelldatum) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <Button :loading="saving" @click="saveLimit">
              {{ $t('common.save', 'Speichern') }}
            </Button>
            <Button variant="secondary" @click="navigateTo('/kreditmanagement')">
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

const limit = ref<any>({})
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { label: t('menu.creditManagement', 'Kreditmanagement'), to: '/kreditmanagement' },
  { label: limit.value?.Kunden?.Firmenname || limit.value?.Kunden?.Vorname || t('kreditmanagement.editLimit', 'Bearbeiten') }
])

const utilizationPercent = computed(() => {
  if (!limit.value.Kreditlimit) return 0
  return (Number(limit.value.AktuelleSchuld) / Number(limit.value.Kreditlimit)) * 100
})

const availableCredit = computed(() => {
  return Math.max(0, Number(limit.value.Kreditlimit) - Number(limit.value.AktuelleSchuld))
})

const openRemindersCount = computed(() => {
  return limit.value.Mahnungen?.filter((m: any) => m.Status === 'Offen').length || 0
})

const getUtilizationTextClass = computed(() => {
  if (utilizationPercent.value >= 100) return 'text-danger-600 font-medium'
  if (utilizationPercent.value >= 80) return 'text-warning-600 font-medium'
  return 'text-secondary-900'
})

const getUtilizationBarClass = computed(() => {
  if (utilizationPercent.value >= 100) return 'bg-danger-500'
  if (utilizationPercent.value >= 80) return 'bg-warning-500'
  if (utilizationPercent.value >= 50) return 'bg-info-500'
  return 'bg-success-500'
})

async function fetchLimit() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/kreditmanagement?id=${id.value}`)
    if (!response || response.status === 404) {
      error.value = t('kreditmanagement.notFound', 'Kreditlimit nicht gefunden')
      return
    }
    limit.value = response
  } catch (err: any) {
    error.value = t('kreditmanagement.errorLoading', 'Fehler beim Laden des Kreditlimits')
    console.error('Fetch Limit Error:', err)
  } finally {
    loading.value = false
  }
}

async function saveLimit() {
  try {
    saving.value = true
    await $fetch(`/api/kreditmanagement?id=${id.value}`, {
      method: 'PUT',
      body: {
        kreditlimit: limit.value.Kreditlimit,
        aktuelleSchuld: limit.value.AktuelleSchuld,
        zahlungsziel: limit.value.Zahlungsziel,
        kreditsperre: limit.value.Kreditsperre,
        sperrgrund: limit.value.Kreditsperre ? limit.value.Sperrgrund : null
      }
    })
    toast.success(t('kreditmanagement.saveSuccess', 'Kreditlimit erfolgreich gespeichert'))
    navigateTo('/kreditmanagement')
  } catch (err: any) {
    toast.error(t('kreditmanagement.errorSaving', 'Fehler beim Speichern des Kreditlimits'))
    console.error('Save Limit Error:', err)
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

function getReminderStatusBadge(status: string): string {
  const baseClass = 'badge text-xs'
  switch (status) {
    case 'Offen': return `${baseClass} badge-warning`
    case 'Versendet': return `${baseClass} badge-info`
    case 'Bezahlt': return `${baseClass} badge-success`
    case 'Storniert': return `${baseClass} bg-secondary-100 text-secondary-700`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchLimit()
})
</script>
