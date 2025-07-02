<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">{{ mode === 'create' ? 'Neue Rechnung' : 'Rechnung Bearbeiten' }}</h2>
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">
      <div class="i-svg-spinners:blocks-wave inline-block" />
      Lade Rechnung...
    </div>
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 max-w-5xl mx-auto">
        <form @submit.prevent="saveRechnung" class="space-y-6">
          <InvoiceDetails
            :rechnung="rechnung"
            :kunden="kunden"
            :kunden-search="kundenSearch"
            :mode="mode"
            @select-kunde="selectKunde"
          />
          
          <!-- Rechnungspositionen Section -->
          <InvoicePositions
            :rechnung="rechnung"
            :rechnungspositionen="rechnungspositionen"
            :all-produkte="allProdukte"
            :filtered-produkte="filteredProdukte"
            :rabatte="rabatte"
            :produkt-search="produktSearch"
            :rabatt-search="rabattSearch"
            :editing-position-index="editingPositionIndex"
            :show-new-position-form="showNewPositionForm"
            :current-position="currentPosition"
            @toggle-new-position-form="toggleNewPositionForm"
            @toggle-edit-position="toggleEditPosition"
            @save-edited-position="saveEditedPosition"
            @delete-position="deletePosition"
            @save-position="savePosition"
            @select-produkt="selectProdukt"
            @search-produkte="searchProdukte"
            @select-rabatt-position="selectRabattPosition"
          />
          
          <!-- RechnungsRabatte Section -->
          <InvoiceDiscounts
            :rechnung="rechnung"
            :rechnungs-rabatte="rechnungsRabatte"
            :rabatte="rabatte"
            :show-rabatt-modal="showRabattModal"
            :editing-rabatt="editingRabatt"
            :current-rabatt="currentRabatt"
            :rabatt-rabatt-search="rabattRabattSearch"
            @add-rabatt="addRabatt"
            @edit-rabatt="editRabatt"
            @delete-rabatt="deleteRabatt"
            @close-rabatt-modal="closeRabattModal"
            @save-rabatt="saveRabatt"
            @select-rabatt="selectRabatt"
          />

          <div class="flex justify-end space-x-3 pt-6">
            <NuxtLink to="/rechnungen" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</NuxtLink>
            <button type="submit" class="bg-teal-500 dark:bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-600 dark:hover:bg-teal-700 transition duration-200 text-sm font-medium">{{ mode === 'create' ? 'Erstellen' : 'Speichern' }}</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        :show="showConfirmModal"
        title="Datenkonflikt"
        message="Die Daten wurden von einem anderen Benutzer geändert. Möchten Sie die neuesten Daten laden und Ihre Änderungen erneut versuchen?"
        confirmText="Ja, Daten laden"
        cancelText="Nein, abbrechen"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />
      
      <!-- RechnungsRabatt Modal -->
      <div v-if="showRabattModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-xl p-6 w-full max-w-lg">
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">{{ editingRabatt ? 'Rabatt Bearbeiten' : 'Neuer Rabatt' }}</h3>
          <form @submit.prevent="saveRabatt" class="space-y-5">
            <div>
              <label for="rabattSelect" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rabatt</label>
              <Autocomplete
                id="rabattSelect"
                :items="rabatte"
                id-key="RabattID"
                :display-fn="item => item.Name"
                :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase())"
                :initial-value="rabattRabattSearch"
                placeholder="Rabatt suchen..."
                @select="selectRabatt"
              />
            </div>
            <div>
              <label for="angewendeterWert" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Angewendeter Wert (optional, %)</label>
              <input id="angewendeterWert" v-model="currentRabatt.AngewendeterWert" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="angewendeterBetrag" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Angewendeter Betrag</label>
              <input id="angewendeterBetrag" v-model="currentRabatt.AngewendeterBetrag" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" @click="closeRabattModal" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</button>
              <button type="submit" class="bg-teal-500 dark:bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-600 dark:hover:bg-teal-700 transition duration-200 text-sm font-medium">Speichern</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from '#app'
import Autocomplete from '~/components/Autocomplete.vue'
import InvoiceDetails from '~/components/InvoiceDetails.vue'
import InvoicePositions from '~/components/InvoicePositions.vue'
import InvoiceDiscounts from '~/components/InvoiceDiscounts.vue'
import ConfirmModal from '~/components/ConfirmModal.vue'

const props = defineProps(['mode', 'id'])
const route = useRoute()
const router = useRouter()
const rechnungId = props.id || route.params.id

const rechnung = ref({
  Rechnungsnummer: '',
  Rechnungsdatum: new Date().toISOString().split('T')[0],
  Faelligkeitsdatum: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  Rechnungsadresse: '',
  Zahlungsstatus: 'Offen',
  GesamtbetragNetto: 0.00,
  MwSt_Gesamt: 0.00,
  GesamtrabattBetrag: 0.00,
  GesamtbetragBrutto: 0.00,
  Waehrung: 'EUR',
  Kommentare: '',
  KundenID: null
})
const rechnungspositionen = ref([])
const rechnungsRabatte = ref([])
const kunden = ref([])
const allProdukte = ref([])
const filteredProdukte = ref([])
const rabatte = ref([])
const loading = ref(props.mode === 'edit')
const error = ref(null)
const showNewPositionForm = ref(false)
const editingPositionIndex = ref(-1)
const showRabattModal = ref(false)
const editingRabatt = ref(false)
const currentPosition = ref({
  RechnungspositionsID: null,
  ProduktID: null,
  Menge: 1.00,
  EinzelpreisNetto: 0.00,
  RabattID: null,
  RabattProzentPosition: 0.00,
  RabattBetragPosition: 0.00,
  GesamtpreisNettoPosition: 0.00,
  MwSt_Satz: 20.00,
  MwSt_Betrag: 0.00,
  Beschreibung: ''
})
const currentPositionIndex = ref(-1)
const produktSearch = ref('')
const rabattSearch = ref('')
const currentRabatt = ref({
  RechnungsRabattID: null,
  RabattID: null,
  AngewendeterWert: null,
  AngewendeterBetrag: 0.00
})
const currentRabattIndex = ref(-1)
const kundenSearch = ref('')
const rabattRabattSearch = ref('')

async function fetchRechnung() {
  if (props.mode !== 'edit' || !rechnungId) {
    loading.value = false
    return
  }
  try {
    loading.value = true
    const response = await $fetch(`/api/rechnungen?id=${rechnungId}`)
    if (response.status === 404) {
      error.value = 'Rechnung nicht gefunden'
    } else {
      rechnung.value = response
      rechnung.value.Rechnungsdatum = new Date(response.Rechnungsdatum).toISOString().split('T')[0]
      rechnung.value.Faelligkeitsdatum = new Date(response.Faelligkeitsdatum).toISOString().split('T')[0]
      setInitialAutocompleteValues()
      if (response.Rechnungspositionen && response.Rechnungspositionen.length > 0) {
        rechnungspositionen.value = response.Rechnungspositionen
        await updateAllProdukteFromPositions()
      }
      if (response.RechnungsRabatte && response.RechnungsRabatte.length > 0) {
        rechnungsRabatte.value = response.RechnungsRabatte
      }
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Rechnung: ' + err.message
  } finally {
    loading.value = false
  }
}

async function fetchKunden() {
  try {
    const response = await $fetch(`/api/kunden`)
    kunden.value = response.data || response
  } catch (err) {
    console.error('Fehler beim Laden der Kunden:', err.message)
  }
}

async function fetchProdukte(search = '') {
  try {
    const url = search ? `/api/produkte?search=${encodeURIComponent(search)}&limit=100` : `/api/produkte?limit=100`
    const response = await $fetch(url)
    if (search) {
      filteredProdukte.value = response.data || response
    } else {
      filteredProdukte.value = response.data || response
    }
  } catch (err) {
    console.error('Fehler beim Laden der Produkte:', err.message)
  }
}

function searchProdukte(searchTerm) {
  if (searchTerm && typeof searchTerm === 'string') {
    fetchProdukte(searchTerm)
  }
}

async function fetchRabatte() {
  try {
    const response = await $fetch(`/api/rabatte`)
    rabatte.value = response.data || response
  } catch (err) {
    console.error('Fehler beim Laden der Rabatte:', err.message)
    rabatte.value = []
  }
}

async function updateAllProdukteFromPositions() {
  try {
    const produktIds = rechnungspositionen.value.map(pos => pos.ProduktID).filter(id => id);
    if (produktIds.length > 0) {
      const response = await $fetch(`/api/produkte?ids=${produktIds.join(',')}`);
      allProdukte.value = response.data || response;
    } else {
      allProdukte.value = [];
    }
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Produkte für Positionen:', err.message);
  }
}

function selectKunde(kunde) {
  if (kunde) {
    rechnung.value.KundenID = kunde.KundenID
    kundenSearch.value = kunde.Firmenname ? kunde.Firmenname : `${kunde.Vorname || ''} ${kunde.Nachname || ''}`
    // Populate Rechnungsadresse with Kunde's address information
    let adresse = '';
    if (kunde.Firmenname) {
      adresse += kunde.Firmenname + '\n';
    }
    if (kunde.Vorname || kunde.Nachname) {
      adresse += `${kunde.Vorname || ''} ${kunde.Nachname || ''}\n`;
    }
    if (kunde.Adresse) {
      adresse += kunde.Adresse + '\n';
    }
    if (kunde.PLZ || kunde.Ort) {
      adresse += `${kunde.PLZ || ''} ${kunde.Ort || ''}\n`;
    }
    if (kunde.Land) {
      adresse += kunde.Land;
    }
    rechnung.value.Rechnungsadresse = adresse.trim();
  } else {
    rechnung.value.KundenID = null
    kundenSearch.value = ''
    rechnung.value.Rechnungsadresse = '';
  }
}

function selectProdukt(produkt) {
  if (produkt) {
    currentPosition.value.ProduktID = produkt.ProduktID
    produktSearch.value = produkt.Produktname
    // Set default values from product if available
    if (produkt.Preise && produkt.Preise.length > 0) {
      const aktionsPrice = produkt.Preise.find(p => p.PreisTyp === 'Aktion');
      if (aktionsPrice) {
        currentPosition.value.EinzelpreisNetto = aktionsPrice.Preis;
      } else {
        const standardPrice = produkt.Preise.find(p => p.PreisTyp === 'Standard');
        if (standardPrice) {
          currentPosition.value.EinzelpreisNetto = standardPrice.Preis;
        }
      }
    }
    if (produkt.Umsatzsteuersaetze) {
      currentPosition.value.MwSt_Satz = produkt.Umsatzsteuersaetze.Steuersatz || 20.00
    }
    // Add the selected product to allProdukte if not already present
    if (!allProdukte.value.some(p => p.ProduktID === produkt.ProduktID)) {
      allProdukte.value.push(produkt);
    }
  } else {
    currentPosition.value.ProduktID = null
    produktSearch.value = ''
  }
}

function selectRabattPosition(rabatt) {
  if (rabatt) {
    currentPosition.value.RabattID = rabatt.RabattID
    rabattSearch.value = rabatt.Name
    if (rabatt.RabattTyp === 'Prozentual') {
      currentPosition.value.RabattProzentPosition = rabatt.Wert || 0.00
    }
  } else {
    currentPosition.value.RabattID = null
    rabattSearch.value = ''
  }
}

function selectRabatt(rabatt) {
  if (rabatt) {
    currentRabatt.value.RabattID = rabatt.RabattID
    rabattRabattSearch.value = rabatt.Name
    if (rabatt.RabattTyp === 'Prozentual') {
      currentRabatt.value.AngewendeterWert = rabatt.Wert || 0.00
    }
  } else {
    currentRabatt.value.RabattID = null
    rabattRabattSearch.value = ''
  }
}

async function saveRechnung() {
  try {
    // Calculate totals before saving
    calculateTotals()
    let rechnungData = { 
      ...rechnung.value, 
      Rechnungspositionen: rechnungspositionen.value,
      RechnungsRabatte: rechnungsRabatte.value
    }
    let success = false;
    if (props.mode === 'create') {
      await $fetch('/api/rechnungen', {
        method: 'POST',
        body: rechnungData
      })
      success = true;
    } else {
      await $fetch(`/api/rechnungen?id=${rechnungId}`, {
        method: 'PUT',
        body: rechnungData
      })
      success = true;
    }
    if (success) {
      router.push('/rechnungen')
    }
  } catch (err) {
    if (err.status === 409) {
      showConfirmModal.value = true;
    } else {
      alert('Fehler beim Speichern der Rechnung: ' + err.message)
    }
  }
}

function handleConfirm() {
  showConfirmModal.value = false;
  fetchRechnung();
}

function handleCancel() {
  showConfirmModal.value = false;
}

function calculateTotals() {
  let totalNetto = 0
  let totalMwSt = 0
  let totalRabatt = 0
  
  rechnungspositionen.value.forEach(pos => {
    const netto = pos.Menge * pos.EinzelpreisNetto
    const rabatt = pos.RabattBetragPosition || 0
    const nettoAfterRabatt = netto - rabatt
    const mwst = nettoAfterRabatt * (pos.MwSt_Satz / 100)
    
    pos.GesamtpreisNettoPosition = nettoAfterRabatt
    pos.MwSt_Betrag = mwst
    
    totalNetto += nettoAfterRabatt
    totalMwSt += mwst
    totalRabatt += rabatt
  })
  
  let totalRabattFromDiscounts = 0
  rechnungsRabatte.value.forEach(rabatt => {
    totalRabattFromDiscounts += rabatt.AngewendeterBetrag
  })
  
  totalRabatt += totalRabattFromDiscounts
  const totalNettoAfterDiscounts = totalNetto - totalRabattFromDiscounts
  
  rechnung.value.GesamtbetragNetto = totalNettoAfterDiscounts
  rechnung.value.MwSt_Gesamt = totalMwSt
  rechnung.value.GesamtrabattBetrag = totalRabatt
  rechnung.value.GesamtbetragBrutto = totalNettoAfterDiscounts + totalMwSt
}

function toggleNewPositionForm() {
  showNewPositionForm.value = !showNewPositionForm.value
  if (showNewPositionForm.value) {
    currentPosition.value = {
      RechnungspositionsID: null,
      ProduktID: null,
      Menge: 1.00,
      EinzelpreisNetto: 0.00,
      RabattID: null,
      RabattProzentPosition: 0.00,
      RabattBetragPosition: 0.00,
      GesamtpreisNettoPosition: 0.00,
      MwSt_Satz: 20.00,
      MwSt_Betrag: 0.00,
      Beschreibung: ''
    }
    produktSearch.value = ''
    rabattSearch.value = ''
    currentPositionIndex.value = -1
    editingPositionIndex.value = -1
  }
}

function toggleEditPosition(index) {
  if (editingPositionIndex.value === index) {
    saveEditedPosition(index)
    editingPositionIndex.value = -1
  } else {
    editingPositionIndex.value = index
  }
}

function saveEditedPosition(index) {
  const position = rechnungspositionen.value[index]
  const netto = position.Menge * position.EinzelpreisNetto
  let rabattBetrag = position.RabattBetragPosition || 0
  
  if (position.RabattProzentPosition > 0 && rabattBetrag === 0) {
    rabattBetrag = netto * (position.RabattProzentPosition / 100)
    position.RabattBetragPosition = rabattBetrag
  }
  
  const nettoAfterRabatt = netto - rabattBetrag
  const mwst = nettoAfterRabatt * (position.MwSt_Satz / 100)
  
  position.GesamtpreisNettoPosition = nettoAfterRabatt
  position.MwSt_Betrag = mwst
  
  rechnungspositionen.value[index] = { ...position }
  calculateTotals()
}

function deletePosition(index) {
  if (confirm('Sind Sie sicher, dass Sie diese Position löschen möchten?')) {
    rechnungspositionen.value.splice(index, 1)
    calculateTotals()
    updateAllProdukteFromPositions()
  }
}

function savePosition() {
  // Calculate totals for the position
  const netto = currentPosition.value.Menge * currentPosition.value.EinzelpreisNetto
  let rabattBetrag = currentPosition.value.RabattBetragPosition || 0
  
  if (currentPosition.value.RabattProzentPosition > 0 && rabattBetrag === 0) {
    rabattBetrag = netto * (currentPosition.value.RabattProzentPosition / 100)
    currentPosition.value.RabattBetragPosition = rabattBetrag
  }
  
  const nettoAfterRabatt = netto - rabattBetrag
  const mwst = nettoAfterRabatt * (currentPosition.value.MwSt_Satz / 100)
  
  currentPosition.value.GesamtpreisNettoPosition = nettoAfterRabatt
  currentPosition.value.MwSt_Betrag = mwst
  
  if (currentPositionIndex.value >= 0) {
    rechnungspositionen.value[currentPositionIndex.value] = { ...currentPosition.value }
  } else {
    rechnungspositionen.value.push({ ...currentPosition.value })
  }
  calculateTotals()
  showNewPositionForm.value = false
  updateAllProdukteFromPositions()
}

function addRabatt() {
  editingRabatt.value = false
  currentRabatt.value = {
    RechnungsRabattID: null,
    RabattID: null,
    AngewendeterWert: null,
    AngewendeterBetrag: 0.00
  }
  rabattRabattSearch.value = ''
  currentRabattIndex.value = -1
  showRabattModal.value = true
}

function editRabatt(index) {
  editingRabatt.value = true
  currentRabatt.value = { ...rechnungsRabatte.value[index] }
  rabattRabattSearch.value = currentRabatt.value.RabattID ? rabatte.value.find(r => r.RabattID === currentRabatt.value.RabattID)?.Name || '' : ''
  currentRabattIndex.value = index
  showRabattModal.value = true
}

function deleteRabatt(index) {
  if (confirm('Sind Sie sicher, dass Sie diesen Rabatt löschen möchten?')) {
    rechnungsRabatte.value.splice(index, 1)
    calculateTotals()
  }
}

function closeRabattModal() {
  showRabattModal.value = false
}

function saveRabatt() {
  if (editingRabatt.value && currentRabattIndex.value >= 0) {
    rechnungsRabatte.value[currentRabattIndex.value] = { ...currentRabatt.value }
  } else {
    rechnungsRabatte.value.push({ ...currentRabatt.value })
  }
  calculateTotals()
  closeRabattModal()
}

function setInitialAutocompleteValues() {
  kundenSearch.value = rechnung.value.KundenID && kunden.value.length > 0 ? (kunden.value.find(k => k.KundenID === rechnung.value.KundenID)?.Firmenname || `${kunden.value.find(k => k.KundenID === rechnung.value.KundenID)?.Vorname || ''} ${kunden.value.find(k => k.KundenID === rechnung.value.KundenID)?.Nachname || ''}` || '') : ''
}

const showConfirmModal = ref(false);

onMounted(async () => {
  await Promise.all([
    fetchKunden(),
    fetchProdukte(),
    fetchRabatte()
  ])
  await fetchRechnung()
})
</script>
