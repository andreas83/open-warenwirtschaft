<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('retouren.newReturn', 'Neue Retoure') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Selection -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('retouren.customer', 'Kunde') }}</h2>
          <AsyncAutocomplete
            v-model="selectedKunde"
            :items="kunden"
            :loading="kundenLoading"
            :display-fn="getKundeDisplayName"
            item-key="KundenID"
            :placeholder="$t('retouren.searchCustomer', 'Kunde suchen...')"
            @search="handleKundeSearch"
          />
          <div v-if="selectedKunde" class="mt-4 p-4 bg-secondary-50 rounded-lg">
            <p class="font-medium text-secondary-900">{{ getKundeDisplayName(selectedKunde) }}</p>
            <p v-if="selectedKunde.Email" class="text-sm text-primary-600">{{ selectedKunde.Email }}</p>
          </div>
        </div>

        <!-- Reason -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('retouren.reason', 'Rucksendegrund') }}</h2>
          <textarea
            v-model="retoure.Ruecksendegrund"
            class="input min-h-24"
            rows="3"
            :placeholder="$t('retouren.reasonPlaceholder', 'Grund fur die Rucksendung angeben...')"
          />
        </div>

        <!-- Return Items -->
        <div class="card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-secondary-800">{{ $t('retouren.items', 'Positionen') }}</h2>
            <Button variant="secondary" size="sm" icon="i-mdi-plus" @click="addPosition">
              {{ $t('retouren.addItem', 'Position hinzufugen') }}
            </Button>
          </div>

          <div v-if="positionen.length === 0" class="text-center py-8 text-secondary-500">
            {{ $t('retouren.noItems', 'Keine Positionen hinzugefugt') }}
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(pos, index) in positionen"
              :key="index"
              class="p-4 border border-secondary-200 rounded-lg"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('retouren.product', 'Produkt') }}</label>
                    <AsyncAutocomplete
                      v-model="pos.Produkt"
                      :items="produkte"
                      :loading="produkteLoading"
                      :display-fn="(p) => p?.Produktname || ''"
                      item-key="ProduktID"
                      :placeholder="$t('retouren.searchProduct', 'Produkt suchen...')"
                      @search="handleProduktSearch"
                      @update:model-value="updatePositionPrice(index)"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-secondary-600 mb-1">{{ $t('retouren.quantity', 'Menge') }}</label>
                    <input
                      v-model.number="pos.Menge"
                      type="number"
                      min="1"
                      step="1"
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
                <span class="text-secondary-500">{{ $t('retouren.creditAmount', 'Gutschrift') }}: </span>
                <span class="font-medium text-secondary-900">{{ formatCurrency(pos.GesamtpreisNetto) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('retouren.summary', 'Zusammenfassung') }}</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('retouren.subtotal', 'Zwischensumme') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-secondary-600">{{ $t('retouren.vat', 'MwSt. (19%)') }}</span>
              <span class="text-secondary-900">{{ formatCurrency(vatAmount) }}</span>
            </div>
            <div class="border-t border-secondary-200 pt-2 mt-2">
              <div class="flex justify-between font-medium">
                <span class="text-secondary-800">{{ $t('retouren.totalCredit', 'Gutschriftbetrag') }}</span>
                <span class="text-lg text-success-600">{{ formatCurrency(grandTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!canSave" @click="saveRetoure">
            {{ $t('retouren.createReturn', 'Retoure erstellen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/retouren')">
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
  { label: t('menu.returns', 'Retouren'), to: '/retouren' },
  { label: t('retouren.newReturn', 'Neue Retoure') }
])

const retoure = ref({
  Ruecksendegrund: ''
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

const subtotal = computed(() => {
  return positionen.value.reduce((sum, pos) => sum + (pos.GesamtpreisNetto || 0), 0)
})

const vatAmount = computed(() => {
  return subtotal.value * 0.19
})

const grandTotal = computed(() => {
  return subtotal.value + vatAmount.value
})

const canSave = computed(() => {
  return selectedKunde.value && positionen.value.length > 0 && positionen.value.every(p => p.Produkt && p.Menge > 0)
})

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

async function saveRetoure() {
  if (!canSave.value) return

  try {
    saving.value = true
    await $fetch('/api/retouren', {
      method: 'POST',
      body: {
        KundenID: selectedKunde.value.KundenID,
        Ruecksendegrund: retoure.value.Ruecksendegrund || null,
        GesamtbetragGutschrift: grandTotal.value,
        Positionen: positionen.value.map(p => ({
          ProduktID: p.ProduktID,
          Menge: p.Menge,
          EinzelpreisNetto: p.EinzelpreisNetto,
          MwSt_Satz: p.MwSt_Satz
        }))
      }
    })
    toast.success(t('retouren.createSuccess', 'Retoure erfolgreich erstellt'))
    navigateTo('/retouren')
  } catch (err: any) {
    toast.error(t('retouren.errorCreating', 'Fehler beim Erstellen der Retoure'))
    console.error('Create Retoure Error:', err)
  } finally {
    saving.value = false
  }
}
</script>
