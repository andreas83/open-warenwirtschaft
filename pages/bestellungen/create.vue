<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('bestellungen.newOrder', 'Neue Bestellung') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Selection -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('bestellungen.customer', 'Kunde') }}</h2>
          <AsyncAutocomplete
            v-model="selectedKunde"
            :items="kunden"
            :loading="kundenLoading"
            :display-fn="getKundeDisplayName"
            item-key="KundenID"
            :placeholder="$t('bestellungen.searchCustomer', 'Kunde suchen...')"
            @search="handleKundeSearch"
          />
          <div v-if="selectedKunde" class="mt-4 p-4 bg-secondary-50 rounded-lg">
            <p class="font-medium text-secondary-900">{{ getKundeDisplayName(selectedKunde) }}</p>
            <p v-if="selectedKunde.Adresse" class="text-sm text-secondary-600">{{ selectedKunde.Adresse }}</p>
            <p v-if="selectedKunde.PLZ || selectedKunde.Ort" class="text-sm text-secondary-600">
              {{ selectedKunde.PLZ }} {{ selectedKunde.Ort }}
            </p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-secondary-800">{{ $t('bestellungen.items', 'Positionen') }}</h2>
            <Button variant="secondary" size="sm" icon="i-mdi-plus" @click="addPosition">
              {{ $t('bestellungen.addItem', 'Position hinzufugen') }}
            </Button>
          </div>

          <div v-if="positionen.length === 0" class="text-center py-8 text-secondary-500">
            {{ $t('bestellungen.noItems', 'Keine Positionen hinzugefugt') }}
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(pos, index) in positionen"
              :key="index"
              class="p-4 border border-secondary-200 rounded-lg"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.product', 'Produkt') }}</label>
                    <AsyncAutocomplete
                      v-model="pos.Produkt"
                      :items="produkte"
                      :loading="produkteLoading"
                      :display-fn="(p) => p?.Produktname || ''"
                      item-key="ProduktID"
                      :placeholder="$t('bestellungen.searchProduct', 'Produkt suchen...')"
                      @search="handleProduktSearch"
                      @update:model-value="updatePositionPrice(index)"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.quantity', 'Menge') }}</label>
                    <input
                      v-model.number="pos.Menge"
                      type="number"
                      min="1"
                      step="1"
                      class="input"
                      @input="calculatePositionTotal(index)"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.unitPrice', 'Einzelpreis') }}</label>
                    <input
                      v-model.number="pos.EinzelpreisNetto"
                      type="number"
                      min="0"
                      step="0.01"
                      class="input"
                      @input="calculatePositionTotal(index)"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="i-mdi-delete"
                  class="text-danger-600 hover:bg-danger-50"
                  @click="removePosition(index)"
                />
              </div>
              <div class="mt-2 text-right text-sm">
                <span class="text-secondary-500">{{ $t('bestellungen.total', 'Gesamt') }}: </span>
                <span class="font-medium text-secondary-900">{{ formatCurrency(pos.GesamtpreisNetto) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Order Details -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('bestellungen.details', 'Details') }}</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.deliveryDate', 'Lieferdatum') }}</label>
              <input v-model="bestellung.Lieferdatum" type="date" class="input" />
            </div>

            <div>
              <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.location', 'Standort') }}</label>
              <select v-model="bestellung.StandortID" class="input">
                <option :value="null">{{ $t('common.select', 'Bitte wahlen...') }}</option>
                <option v-for="s in standorte" :key="s.StandortID" :value="s.StandortID">
                  {{ s.Name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.shippingCost', 'Versandkosten') }}</label>
              <input v-model.number="bestellung.Versandkosten" type="number" min="0" step="0.01" class="input" />
            </div>

            <div>
              <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.deliveryAddress', 'Lieferadresse') }}</label>
              <textarea v-model="bestellung.Lieferadresse" class="input min-h-20" rows="2" />
            </div>

            <div>
              <label class="block text-sm text-secondary-600 mb-1">{{ $t('bestellungen.comments', 'Kommentar') }}</label>
              <textarea v-model="bestellung.Kommentare" class="input min-h-20" rows="2" />
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('bestellungen.summary', 'Zusammenfassung') }}</h2>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('bestellungen.subtotal', 'Zwischensumme') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('bestellungen.vat', 'MwSt. (19%)') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(vatAmount) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('bestellungen.shipping', 'Versand') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(bestellung.Versandkosten || 0) }}</span>
            </div>
            <div class="border-t border-secondary-200 pt-2 mt-2">
              <div class="flex justify-between font-medium">
                <span class="text-secondary-800">{{ $t('bestellungen.grandTotal', 'Gesamtbetrag') }}</span>
                <span class="text-lg text-primary-600">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!canSave" @click="saveBestellung">
            {{ $t('bestellungen.createOrder', 'Bestellung erstellen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/bestellungen')">
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
  { label: t('menu.orders', 'Bestellungen'), to: '/bestellungen' },
  { label: t('bestellungen.newOrder', 'Neue Bestellung') }
])

const bestellung = ref({
  Lieferdatum: '',
  StandortID: null as number | null,
  Versandkosten: 0,
  Lieferadresse: '',
  Kommentare: ''
})

const positionen = ref<any[]>([])
const selectedKunde = ref<any>(null)
const saving = ref(false)

// Kunden search
const kunden = ref<any[]>([])
const kundenLoading = ref(false)

// Produkte search
const produkte = ref<any[]>([])
const produkteLoading = ref(false)

// Standorte
const standorte = ref<any[]>([])

const subtotal = computed(() => {
  return positionen.value.reduce((sum, pos) => sum + (pos.GesamtpreisNetto || 0), 0)
})

const vatAmount = computed(() => {
  return subtotal.value * 0.19
})

const grandTotal = computed(() => {
  return subtotal.value + vatAmount.value + (bestellung.value.Versandkosten || 0)
})

const canSave = computed(() => {
  return selectedKunde.value && positionen.value.length > 0 && positionen.value.every(p => p.Produkt && p.Menge > 0)
})

async function fetchStandorte() {
  try {
    const response = await $fetch('/api/standorte')
    standorte.value = Array.isArray(response) ? response : []
  } catch (err) {
    console.error('Fetch Standorte Error:', err)
  }
}

async function handleKundeSearch(query: string) {
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

function getKundeDisplayName(kunde: any): string {
  if (!kunde) return ''
  if (kunde.Firmenname) return kunde.Firmenname
  return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || 'Unbekannt'
}

function addPosition() {
  positionen.value.push({
    Produkt: null,
    ProduktID: null,
    Menge: 1,
    EinzelpreisNetto: 0,
    GesamtpreisNetto: 0,
    MwSt_Satz: 19
  })
}

function removePosition(index: number) {
  positionen.value.splice(index, 1)
}

function updatePositionPrice(index: number) {
  const pos = positionen.value[index]
  if (pos.Produkt) {
    pos.ProduktID = pos.Produkt.ProduktID
    // Try to get the standard price
    const standardPreis = pos.Produkt.Preise?.find((p: any) => p.PreisTyp === 'Standard')
    pos.EinzelpreisNetto = standardPreis?.Preis || 0
    calculatePositionTotal(index)
  }
}

function calculatePositionTotal(index: number) {
  const pos = positionen.value[index]
  pos.GesamtpreisNetto = (pos.Menge || 0) * (pos.EinzelpreisNetto || 0)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

async function saveBestellung() {
  if (!canSave.value) return

  try {
    saving.value = true
    await $fetch('/api/bestellungen', {
      method: 'POST',
      body: {
        KundenID: selectedKunde.value.KundenID,
        StandortID: bestellung.value.StandortID,
        Lieferdatum: bestellung.value.Lieferdatum || null,
        Lieferadresse: bestellung.value.Lieferadresse || null,
        Versandkosten: bestellung.value.Versandkosten || 0,
        Kommentare: bestellung.value.Kommentare || null,
        GesamtsummeNetto: subtotal.value,
        GesamtsummeBrutto: grandTotal.value,
        Positionen: positionen.value.map(p => ({
          ProduktID: p.ProduktID,
          Menge: p.Menge,
          EinzelpreisNetto: p.EinzelpreisNetto,
          MwSt_Satz: p.MwSt_Satz
        }))
      }
    })
    toast.success(t('bestellungen.createSuccess', 'Bestellung erfolgreich erstellt'))
    navigateTo('/bestellungen')
  } catch (err: any) {
    toast.error(t('bestellungen.errorCreating', 'Fehler beim Erstellen der Bestellung'))
    console.error('Create Bestellung Error:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchStandorte()
})
</script>
