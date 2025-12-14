<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kreditmanagement.newLimit', 'Neues Kreditlimit') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Selection -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.customer', 'Kunde') }}</h2>
          <div>
            <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.selectCustomer', 'Kunde auswahlen') }} *</label>
            <AsyncAutocomplete
              v-model="selectedKunde"
              :items="kunden"
              :loading="kundenLoading"
              :display-fn="(k) => k?.Firmenname || (k?.Vorname + ' ' + k?.Nachname) || ''"
              item-key="KundenID"
              :placeholder="$t('kreditmanagement.searchCustomer', 'Kunde suchen...')"
              @search="handleKundenSearch"
            />
          </div>
        </div>

        <!-- Credit Details -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.creditDetails', 'Kreditdetails') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.creditLimit', 'Kreditlimit') }} *</label>
              <div class="relative">
                <input v-model.number="limit.kreditlimit" type="number" min="0" step="0.01" class="input pr-12" required />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">EUR</span>
              </div>
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.currentDebt', 'Aktuelle Schuld') }}</label>
              <div class="relative">
                <input v-model.number="limit.aktuelleSchuld" type="number" min="0" step="0.01" class="input pr-12" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">EUR</span>
              </div>
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.paymentTerms', 'Zahlungsziel (Tage)') }}</label>
              <input v-model.number="limit.zahlungsziel" type="number" min="0" class="input" />
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
                v-model="limit.kreditsperre"
                type="checkbox"
                class="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <label for="kreditsperre" class="text-secondary-700">
                {{ $t('kreditmanagement.blockCredit', 'Kredit sperren') }}
              </label>
            </div>
            <div v-if="limit.kreditsperre">
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('kreditmanagement.blockReason', 'Sperrgrund') }}</label>
              <textarea v-model="limit.sperrgrund" class="input min-h-20" rows="2" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('kreditmanagement.summary', 'Zusammenfassung') }}</h2>
          <div class="space-y-3">
            <div v-if="selectedKunde" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('kreditmanagement.customer', 'Kunde') }}</span>
              <span class="font-medium text-secondary-900">{{ selectedKunde.Firmenname || selectedKunde.Vorname + ' ' + selectedKunde.Nachname }}</span>
            </div>
            <div v-if="limit.kreditlimit" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('kreditmanagement.creditLimit', 'Kreditlimit') }}</span>
              <span class="font-medium text-secondary-900">{{ formatCurrency(limit.kreditlimit) }}</span>
            </div>
            <div v-if="limit.zahlungsziel" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('kreditmanagement.paymentTerms', 'Zahlungsziel') }}</span>
              <span class="text-secondary-900">{{ limit.zahlungsziel }} {{ $t('kreditmanagement.days', 'Tage') }}</span>
            </div>
            <div v-if="limit.kreditsperre" class="mt-3">
              <span class="badge badge-danger">{{ $t('kreditmanagement.blocked', 'Gesperrt') }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!canSave" @click="saveLimit">
            {{ $t('kreditmanagement.createLimit', 'Kreditlimit erstellen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/kreditmanagement')">
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
  { label: t('menu.creditManagement', 'Kreditmanagement'), to: '/kreditmanagement' },
  { label: t('kreditmanagement.newLimit', 'Neues Kreditlimit') }
])

const limit = ref({
  kreditlimit: null as number | null,
  aktuelleSchuld: 0,
  zahlungsziel: 30,
  kreditsperre: false,
  sperrgrund: ''
})

const selectedKunde = ref<any>(null)
const kunden = ref<any[]>([])
const kundenLoading = ref(false)
const saving = ref(false)

const canSave = computed(() => {
  return selectedKunde.value && limit.value.kreditlimit && limit.value.kreditlimit > 0
})

async function handleKundenSearch(query: string) {
  if (!query) {
    kunden.value = []
    return
  }
  try {
    kundenLoading.value = true
    const response = await $fetch(`/api/kunden?limit=20&search=${encodeURIComponent(query)}`)
    kunden.value = Array.isArray(response) ? response : response?.data || []
  } catch (err) {
    console.error('Fetch Kunden Error:', err)
    kunden.value = []
  } finally {
    kundenLoading.value = false
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

async function saveLimit() {
  if (!canSave.value) return

  try {
    saving.value = true
    const response = await $fetch('/api/kreditmanagement', {
      method: 'POST',
      body: {
        kundenId: selectedKunde.value.KundenID,
        kreditlimit: limit.value.kreditlimit,
        aktuelleSchuld: limit.value.aktuelleSchuld || 0,
        zahlungsziel: limit.value.zahlungsziel || 30,
        kreditsperre: limit.value.kreditsperre,
        sperrgrund: limit.value.kreditsperre ? limit.value.sperrgrund : null
      }
    })
    if (response?.status === 400) {
      toast.error(response.error || t('kreditmanagement.errorCreating', 'Fehler beim Erstellen'))
      return
    }
    toast.success(t('kreditmanagement.createSuccess', 'Kreditlimit erfolgreich erstellt'))
    navigateTo('/kreditmanagement')
  } catch (err: any) {
    toast.error(t('kreditmanagement.errorCreating', 'Fehler beim Erstellen des Kreditlimits'))
    console.error('Create Limit Error:', err)
  } finally {
    saving.value = false
  }
}
</script>
