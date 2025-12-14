<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('restaurant.orders.newOrder', 'Neue Bestellung') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Table Selection -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.tableSelection', 'Tischauswahl') }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <button
              v-for="tisch in tische"
              :key="tisch.TischID"
              type="button"
              :class="[
                'p-4 rounded-lg border-2 transition-all text-center',
                selectedTisch?.TischID === tisch.TischID
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : tisch.Status === 'Besetzt'
                    ? 'border-danger-200 bg-danger-50 text-danger-700 cursor-not-allowed opacity-60'
                    : 'border-secondary-200 hover:border-primary-300 hover:bg-secondary-50'
              ]"
              :disabled="tisch.Status === 'Besetzt'"
              @click="selectTisch(tisch)"
            >
              <div class="text-2xl font-bold">{{ tisch.Tischnummer }}</div>
              <div class="text-xs mt-1">{{ tisch.Tischname || `Tisch ${tisch.Tischnummer}` }}</div>
              <div class="text-xs text-secondary-500">{{ tisch.Kapazitaet }} Platze</div>
            </button>
          </div>
        </div>

        <!-- Order Items -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-secondary-800">{{ $t('restaurant.orders.items', 'Bestellpositionen') }}</h2>
          </div>

          <!-- Product Search -->
          <div class="mb-4">
            <AsyncAutocomplete
              v-model="selectedProdukt"
              :items="produkte"
              :loading="produkteLoading"
              :display-fn="(p) => p?.Produktname || ''"
              item-key="ProduktID"
              :placeholder="$t('restaurant.orders.searchProduct', 'Produkt suchen und hinzufugen...')"
              @search="handleProduktSearch"
              @update:model-value="addProdukt"
            />
          </div>

          <div v-if="positionen.length === 0" class="text-center py-8 text-secondary-500">
            {{ $t('restaurant.orders.noItems', 'Keine Artikel hinzugefugt') }}
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(pos, index) in positionen"
              :key="index"
              class="flex items-center gap-4 p-3 bg-secondary-50 rounded-lg"
            >
              <div class="flex-1">
                <div class="font-medium text-secondary-900">{{ pos.Produktname }}</div>
                <div class="text-sm text-secondary-500">{{ formatCurrency(pos.Einzelpreis) }}</div>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon="i-mdi-minus"
                  @click="decreaseQuantity(index)"
                />
                <span class="w-8 text-center font-medium">{{ pos.Menge }}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="i-mdi-plus"
                  @click="increaseQuantity(index)"
                />
              </div>
              <div class="w-24 text-right font-medium text-secondary-900">
                {{ formatCurrency(pos.Einzelpreis * pos.Menge) }}
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="i-mdi-delete"
                class="text-danger-600 hover:bg-danger-50"
                @click="removePosition(index)"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.notes', 'Notizen') }}</h2>
          <textarea
            v-model="bestellung.notizen"
            class="input min-h-20"
            rows="2"
            :placeholder="$t('restaurant.orders.notesPlaceholder', 'Besondere Wunsche, Allergien...')"
          />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Guest Count -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.details', 'Details') }}</h2>
          <div>
            <label class="block text-secondary-700 font-medium mb-2">{{ $t('restaurant.orders.guestCount', 'Anzahl Gaste') }}</label>
            <input
              v-model.number="bestellung.personenAnzahl"
              type="number"
              min="1"
              class="input"
            />
          </div>
        </div>

        <!-- Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('restaurant.orders.summary', 'Zusammenfassung') }}</h2>
          <div class="space-y-2 text-sm">
            <div v-if="selectedTisch" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('restaurant.orders.table', 'Tisch') }}</span>
              <span class="font-medium text-secondary-900">{{ selectedTisch.Tischname || `Tisch ${selectedTisch.Tischnummer}` }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('restaurant.orders.itemCount', 'Artikel') }}</span>
              <span class="text-secondary-900">{{ positionen.length }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('restaurant.orders.subtotal', 'Zwischensumme') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('restaurant.orders.vat', 'MwSt.') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(vatAmount) }}</span>
            </div>
            <div class="border-t border-secondary-200 pt-2 mt-2">
              <div class="flex justify-between font-medium">
                <span class="text-secondary-800">{{ $t('restaurant.orders.total', 'Gesamt') }}</span>
                <span class="text-xl text-primary-600">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!canSave" @click="saveBestellung">
            {{ $t('restaurant.orders.createOrder', 'Bestellung aufnehmen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/restaurant/bestellungen')">
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
  { label: t('menu.restaurant', 'Restaurant'), to: '/restaurant' },
  { label: t('restaurant.orders.title', 'Bestellungen'), to: '/restaurant/bestellungen' },
  { label: t('restaurant.orders.newOrder', 'Neue Bestellung') }
])

const bestellung = ref({
  personenAnzahl: 2,
  notizen: ''
})

const positionen = ref<any[]>([])
const tische = ref<any[]>([])
const selectedTisch = ref<any>(null)
const saving = ref(false)

// Produkte search
const produkte = ref<any[]>([])
const produkteLoading = ref(false)
const selectedProdukt = ref<any>(null)

const subtotal = computed(() => {
  return positionen.value.reduce((sum, pos) => sum + (pos.Einzelpreis * pos.Menge), 0)
})

const vatAmount = computed(() => {
  return positionen.value.reduce((sum, pos) => {
    const mwstSatz = pos.MwStSatz || 19
    return sum + (pos.Einzelpreis * pos.Menge * mwstSatz / 100)
  }, 0)
})

const grandTotal = computed(() => {
  return subtotal.value + vatAmount.value
})

const canSave = computed(() => {
  return selectedTisch.value && positionen.value.length > 0
})

async function fetchTische() {
  try {
    const response = await $fetch('/api/restaurant/tische')
    tische.value = Array.isArray(response) ? response : response?.tables || []
  } catch (err) {
    console.error('Fetch Tische Error:', err)
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

function selectTisch(tisch: any) {
  if (tisch.Status !== 'Besetzt') {
    selectedTisch.value = tisch
  }
}

function addProdukt(produkt: any) {
  if (!produkt) return

  const existingIndex = positionen.value.findIndex(p => p.ProduktID === produkt.ProduktID)
  if (existingIndex >= 0) {
    positionen.value[existingIndex].Menge++
  } else {
    const standardPreis = produkt.Preise?.find((p: any) => p.PreisTyp === 'Standard')
    const mwstSatz = produkt.Umsatzsteuersaetze?.Steuersatz || 19
    positionen.value.push({
      ProduktID: produkt.ProduktID,
      Produktname: produkt.Produktname,
      Einzelpreis: standardPreis?.Preis || 0,
      Menge: 1,
      MwStSatz: mwstSatz
    })
  }

  // Clear selection
  selectedProdukt.value = null
}

function increaseQuantity(index: number) {
  positionen.value[index].Menge++
}

function decreaseQuantity(index: number) {
  if (positionen.value[index].Menge > 1) {
    positionen.value[index].Menge--
  }
}

function removePosition(index: number) {
  positionen.value.splice(index, 1)
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
    await $fetch('/api/restaurant/bestellungen', {
      method: 'POST',
      body: {
        tischId: selectedTisch.value.TischID,
        personenAnzahl: bestellung.value.personenAnzahl,
        notizen: bestellung.value.notizen,
        gesamtbetragNetto: subtotal.value,
        mwStGesamt: vatAmount.value,
        gesamtbetragBrutto: grandTotal.value,
        positionen: positionen.value.map(p => ({
          produktId: p.ProduktID,
          menge: p.Menge,
          einzelpreisNetto: p.Einzelpreis,
          mwStSatz: p.MwStSatz
        }))
      }
    })
    toast.success(t('restaurant.orders.createSuccess', 'Bestellung erfolgreich aufgenommen'))
    navigateTo('/restaurant/bestellungen')
  } catch (err: any) {
    toast.error(t('restaurant.orders.errorCreating', 'Fehler beim Erstellen der Bestellung'))
    console.error('Create Bestellung Error:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchTische()
})
</script>
