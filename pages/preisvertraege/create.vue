<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('preisvertraege.newContract', 'Neuer Preisvertrag') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Selection -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.customer', 'Kunde') }}</h2>
          <div>
            <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.selectCustomer', 'Kunde auswahlen') }} *</label>
            <AsyncAutocomplete
              v-model="selectedKunde"
              :items="kunden"
              :loading="kundenLoading"
              :display-fn="(k) => k?.Firmenname || (k?.Vorname + ' ' + k?.Nachname) || ''"
              item-key="KundenID"
              :placeholder="$t('preisvertraege.searchCustomer', 'Kunde suchen...')"
              @search="handleKundenSearch"
            />
          </div>
        </div>

        <!-- Contract Details -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.details', 'Vertragsdetails') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.title', 'Vertragsbezeichnung') }} *</label>
              <input v-model="vertrag.vertragsbezeichnung" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.validFrom', 'Gultig ab') }} *</label>
              <input v-model="vertrag.gueltigAb" type="date" class="input" required />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.validUntil', 'Gultig bis') }}</label>
              <input v-model="vertrag.gueltigBis" type="date" class="input" />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.minimumOrder', 'Mindestabnahme') }}</label>
              <input v-model.number="vertrag.mindestabnahme" type="number" min="0" step="0.01" class="input" />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.paymentTerms', 'Zahlungsbedingungen') }}</label>
              <input v-model="vertrag.zahlungsbedingungen" type="text" class="input" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('preisvertraege.description', 'Beschreibung') }}</label>
              <textarea v-model="vertrag.beschreibung" class="input min-h-20" rows="2" />
            </div>
          </div>
        </div>

        <!-- Contract Positions -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-secondary-800">{{ $t('preisvertraege.positions', 'Vertragspositionen') }}</h2>
            <Button variant="secondary" size="sm" icon="i-mdi-plus" @click="addPosition">
              {{ $t('preisvertraege.addPosition', 'Position hinzufugen') }}
            </Button>
          </div>

          <div v-if="vertrag.positionen.length === 0" class="text-center py-8 text-secondary-500">
            {{ $t('preisvertraege.noPositions', 'Keine Positionen hinzugefugt') }}
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(pos, index) in vertrag.positionen"
              :key="index"
              class="p-4 border border-secondary-200 rounded-lg"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('preisvertraege.product', 'Produkt') }}</label>
                    <AsyncAutocomplete
                      v-model="pos.produkt"
                      :items="produkte"
                      :loading="produkteLoading"
                      :display-fn="(p) => p?.Produktname || ''"
                      item-key="ProduktID"
                      :placeholder="$t('preisvertraege.searchProduct', 'Produkt suchen...')"
                      @search="handleProduktSearch"
                      @update:model-value="(p) => updatePosition(index, p)"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('preisvertraege.fromQuantity', 'Ab Menge') }}</label>
                    <input v-model.number="pos.mengeAb" type="number" min="1" step="1" class="input" />
                  </div>
                  <div>
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('preisvertraege.contractPrice', 'Vertragspreis') }}</label>
                    <input v-model.number="pos.vertragspreis" type="number" min="0" step="0.01" class="input" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="i-mdi-delete"
                  class="text-danger-600 hover:bg-danger-50 mt-6"
                  @click="removePosition(index)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.notes', 'Kommentare') }}</h2>
          <textarea v-model="vertrag.kommentare" class="input min-h-20" rows="3" />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.status', 'Status') }}</h2>
          <select v-model="vertrag.status" class="input">
            <option value="Aktiv">{{ $t('preisvertraege.status.active', 'Aktiv') }}</option>
            <option value="Inaktiv">{{ $t('preisvertraege.status.inactive', 'Inaktiv') }}</option>
          </select>
        </div>

        <!-- Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('preisvertraege.summary', 'Zusammenfassung') }}</h2>
          <div class="space-y-2 text-sm">
            <div v-if="selectedKunde" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('preisvertraege.customer', 'Kunde') }}</span>
              <span class="font-medium text-secondary-900">{{ selectedKunde.Firmenname || selectedKunde.Vorname + ' ' + selectedKunde.Nachname }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('preisvertraege.positions', 'Positionen') }}</span>
              <span class="text-secondary-900">{{ vertrag.positionen.length }}</span>
            </div>
            <div v-if="vertrag.mindestabnahme" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('preisvertraege.minimumOrder', 'Mindestabnahme') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(vertrag.mindestabnahme) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!canSave" @click="saveVertrag">
            {{ $t('preisvertraege.createContract', 'Vertrag erstellen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/preisvertraege')">
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
  { label: t('menu.priceContracts', 'Preisvertrage'), to: '/preisvertraege' },
  { label: t('preisvertraege.newContract', 'Neuer Vertrag') }
])

const vertrag = ref({
  vertragsbezeichnung: '',
  beschreibung: '',
  gueltigAb: '',
  gueltigBis: '',
  status: 'Aktiv',
  zahlungsbedingungen: '',
  mindestabnahme: null as number | null,
  kommentare: '',
  positionen: [] as any[]
})

const selectedKunde = ref<any>(null)
const kunden = ref<any[]>([])
const kundenLoading = ref(false)
const produkte = ref<any[]>([])
const produkteLoading = ref(false)
const saving = ref(false)

const canSave = computed(() => {
  return selectedKunde.value && vertrag.value.vertragsbezeichnung && vertrag.value.gueltigAb
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

async function handleProduktSearch(query: string) {
  if (!query) {
    produkte.value = []
    return
  }
  try {
    produkteLoading.value = true
    const response = await $fetch(`/api/produkte?limit=20&search=${encodeURIComponent(query)}`)
    produkte.value = Array.isArray(response) ? response : response?.data || []
  } catch (err) {
    console.error('Fetch Produkte Error:', err)
    produkte.value = []
  } finally {
    produkteLoading.value = false
  }
}

function addPosition() {
  vertrag.value.positionen.push({
    produkt: null,
    produktId: null,
    mengeAb: 1,
    mengeBis: null,
    vertragspreis: 0
  })
}

function updatePosition(index: number, produkt: any) {
  if (produkt) {
    vertrag.value.positionen[index].produktId = produkt.ProduktID
    // Set default price from product's standard price
    const standardPreis = produkt.Preise?.find((p: any) => p.PreisTyp === 'Standard')
    if (standardPreis) {
      vertrag.value.positionen[index].vertragspreis = Number(standardPreis.Preis)
    }
  }
}

function removePosition(index: number) {
  vertrag.value.positionen.splice(index, 1)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

async function saveVertrag() {
  if (!canSave.value) return

  try {
    saving.value = true
    await $fetch('/api/preisvertraege', {
      method: 'POST',
      body: {
        kundenId: selectedKunde.value.KundenID,
        vertragsbezeichnung: vertrag.value.vertragsbezeichnung,
        beschreibung: vertrag.value.beschreibung || null,
        gueltigAb: vertrag.value.gueltigAb,
        gueltigBis: vertrag.value.gueltigBis || null,
        status: vertrag.value.status,
        zahlungsbedingungen: vertrag.value.zahlungsbedingungen || null,
        mindestabnahme: vertrag.value.mindestabnahme,
        kommentare: vertrag.value.kommentare || null,
        positionen: vertrag.value.positionen
          .filter(p => p.produktId)
          .map(p => ({
            produktId: p.produktId,
            mengeAb: p.mengeAb,
            mengeBis: p.mengeBis,
            vertragspreis: p.vertragspreis
          }))
      }
    })
    toast.success(t('preisvertraege.createSuccess', 'Vertrag erfolgreich erstellt'))
    navigateTo('/preisvertraege')
  } catch (err: any) {
    toast.error(t('preisvertraege.errorCreating', 'Fehler beim Erstellen des Vertrags'))
    console.error('Create Vertrag Error:', err)
  } finally {
    saving.value = false
  }
}
</script>
