<template>
  <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
    <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Rechnungspositionen</h3>
    <div v-if="rechnungspositionen.length > 0" class="mb-6 overflow-x-auto">
      <table class="min-w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg">
        <thead class="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Produkt</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Menge</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Einzelpreis Netto</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rabatt</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Gesamt Netto</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">MwSt. Satz</th>
            <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(position, index) in rechnungspositionen" :key="position.RechnungspositionsID || index" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
            <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              {{ allProdukte.find(p => p.ProduktID === position.ProduktID)?.Produktname || 'Unbekannt' }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              <input v-if="editingPositionIndex === index" v-model="position.Menge" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" @blur="saveEditedPosition(index)" />
              <span v-else>{{ position.Menge }}</span>
            </td>
            <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              <input v-if="editingPositionIndex === index" v-model="position.EinzelpreisNetto" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" @blur="saveEditedPosition(index)" />
              <span v-else>{{ Number(position.EinzelpreisNetto).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</span>
            </td>
            <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              <input v-if="editingPositionIndex === index" v-model="position.RabattBetragPosition" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" @blur="saveEditedPosition(index)" />
              <span v-else>{{ position.RabattBetragPosition ? Number(position.RabattBetragPosition).toFixed(2) : '0.00' }} {{ rechnung.Waehrung || 'EUR' }}</span>
            </td>
            <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              {{ Number(position.GesamtpreisNettoPosition).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}
            </td>
            <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              <input v-if="editingPositionIndex === index" v-model="position.MwSt_Satz" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" @blur="saveEditedPosition(index)" />
              <span v-else>{{ position.MwSt_Satz }}%</span>
            </td>
            <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex gap-2">
              <button type="button" @click="toggleEditPosition(index)" class="bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-md hover:bg-teal-100 dark:hover:bg-teal-800 transition duration-200 text-sm font-medium">{{ editingPositionIndex === index ? 'Speichern' : 'Bearbeiten' }}</button>
              <button type="button" @click="deletePosition(index)" class="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800 transition duration-200 text-sm font-medium">Löschen</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showNewPositionForm" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-xl p-6 w-full max-w-4xl">
        <h4 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">{{ currentPositionIndex >= 0 ? 'Position Bearbeiten' : 'Neue Position Hinzufügen' }}</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label for="newProdukt" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Produkt</label>
            <Autocomplete
              id="newProdukt"
              :items="filteredProdukte"
              id-key="ProduktID"
              :display-fn="item => item.Produktname"
              :filter-fn="(item, search) => item.Produktname.toLowerCase().includes(search.toLowerCase())"
              :initial-value="produktSearch"
              placeholder="Produkt suchen..."
              @select="selectProdukt"
              @input="searchProdukte"
            />
          </div>
          <div>
            <label for="newMenge" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Menge</label>
            <input id="newMenge" v-model="currentPosition.Menge" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
          </div>
          <div>
            <label for="newEinzelpreisNetto" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Einzelpreis Netto</label>
            <input id="newEinzelpreisNetto" v-model="currentPosition.EinzelpreisNetto" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
          </div>
          <div>
            <label for="newRabatt" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rabatt (optional)</label>
            <Autocomplete
              id="newRabatt"
              :items="rabatte"
              id-key="RabattID"
              :display-fn="item => item.Name"
              :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase())"
              :initial-value="rabattSearch"
              placeholder="Rabatt suchen..."
              @select="selectRabattPosition"
            />
          </div>
          <div>
            <label for="newRabattProzent" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rabatt Prozent (optional)</label>
            <input id="newRabattProzent" v-model="currentPosition.RabattProzentPosition" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          </div>
          <div>
            <label for="newRabattBetrag" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rabatt Betrag (optional)</label>
            <input id="newRabattBetrag" v-model="currentPosition.RabattBetragPosition" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          </div>
          <div>
            <label for="newMwstSatz" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">MwSt. Satz (%)</label>
            <input id="newMwstSatz" v-model="currentPosition.MwSt_Satz" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
          </div>
          <div class="md:col-span-2">
            <label for="newBeschreibung" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Beschreibung (optional)</label>
            <textarea id="newBeschreibung" v-model="currentPosition.Beschreibung" rows="2" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
          </div>
        </div>
        
        <!-- Tabbed Interface for Product Details -->
        <div v-if="currentPosition.ProduktID" class="mb-4">
          <div class="flex border-b border-gray-200 dark:border-gray-600">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :class="['px-4 py-2 -mb-px', activeTab === tab.id ? 'border-b-2 border-teal-500 text-teal-500 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300']"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          <div class="mt-4">
            <div v-if="activeTab === 'basic'" class="space-y-3">
              <p class="text-gray-700 dark:text-gray-300">Produktinformationen für: <strong>{{ selectedProduct?.Produktname || 'Unbekannt' }}</strong></p>
              <p class="text-gray-600 dark:text-gray-400">{{ selectedProduct?.Beschreibung || 'Keine Beschreibung verfügbar.' }}</p>
            </div>
            <div v-else-if="activeTab === 'categories'" class="space-y-3">
              <p class="text-gray-700 dark:text-gray-300">Kategorien für: <strong>{{ selectedProduct?.Produktname || 'Unbekannt' }}</strong></p>
              <ul v-if="selectedProduct?.ProduktZuKategorie && selectedProduct.ProduktZuKategorie.length > 0" class="list-disc list-inside text-gray-600 dark:text-gray-400">
                <li v-for="kategorie in selectedProduct.ProduktZuKategorie" :key="kategorie.KategorieID">{{ kategorie.Name }}</li>
              </ul>
              <p v-else class="text-gray-500 dark:text-gray-400">Keine Kategorien zugeordnet.</p>
            </div>
            <div v-else-if="activeTab === 'images'" class="space-y-3">
              <p class="text-gray-700 dark:text-gray-300">Bilder für: <strong>{{ selectedProduct?.Produktname || 'Unbekannt' }}</strong></p>
              <div v-if="selectedProduct?.ProduktBilder && selectedProduct.ProduktBilder.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="bild in selectedProduct.ProduktBilder" :key="bild.BildID" class="relative group">
                  <img :src="bild.BildPfad" :alt="'Produktbild ' + bild.BildID" class="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600">
                  <div v-if="bild.IstHauptbild" class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Hauptbild</div>
                </div>
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400">Keine Bilder verfügbar.</p>
            </div>
            <div v-else-if="activeTab === 'suppliers'" class="space-y-3">
              <p class="text-gray-700 dark:text-gray-300">Lieferanten für: <strong>{{ selectedProduct?.Produktname || 'Unbekannt' }}</strong></p>
              <div v-if="selectedProduct?.ProduktLieferanten && selectedProduct.ProduktLieferanten.length > 0" class="space-y-3">
                <div v-for="lieferant in selectedProduct.ProduktLieferanten" :key="lieferant.LieferantenID" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                  <p class="text-gray-600 dark:text-gray-400"><strong>Lieferant:</strong> {{ lieferant.Firmenname || 'Unbekannt' }}</p>
                  <p v-if="lieferant.LieferantenArtikelnummer" class="text-gray-600 dark:text-gray-400"><strong>Artikelnummer:</strong> {{ lieferant.LieferantenArtikelnummer }}</p>
                  <p v-if="lieferant.Lieferzeit" class="text-gray-600 dark:text-gray-400"><strong>Lieferzeit (Tage):</strong> {{ lieferant.Lieferzeit }}</p>
                  <p v-if="lieferant.Mindestbestellmenge" class="text-gray-600 dark:text-gray-400"><strong>Mindestbestellmenge:</strong> {{ lieferant.Mindestbestellmenge }}</p>
                  <p v-if="lieferant.PreisBeimLieferanten" class="text-gray-600 dark:text-gray-400"><strong>Preis:</strong> {{ lieferant.PreisBeimLieferanten }} {{ lieferant.WaehrungLieferant || 'EUR' }}</p>
                </div>
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400">Keine Lieferanten zugeordnet.</p>
            </div>
            <div v-else-if="activeTab === 'prices'" class="space-y-3">
              <p class="text-gray-700 dark:text-gray-300">Preise für: <strong>{{ selectedProduct?.Produktname || 'Unbekannt' }}</strong></p>
              <div v-if="selectedProduct?.Preise && selectedProduct.Preise.length > 0" class="space-y-3">
                <div v-for="preis in selectedProduct.Preise" :key="preis.PreisID" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600 flex justify-between items-center">
                  <div class="text-gray-600 dark:text-gray-400">
                    <p><strong>Preis:</strong> {{ Number(preis.Preis).toFixed(2) }} {{ preis.Waehrung || 'EUR' }}</p>
                    <p><strong>Typ:</strong> {{ preis.PreisTyp }}</p>
                    <p><strong>Gültig ab:</strong> {{ formatDate(preis.GueltigAb) }}</p>
                    <p v-if="preis.GueltigBis"><strong>Gültig bis:</strong> {{ formatDate(preis.GueltigBis) }}</p>
                  </div>
                  <button type="button" @click="applyPrice(preis)" class="bg-teal-500 dark:bg-teal-600 text-white px-3 py-1 rounded-md hover:bg-teal-600 dark:hover:bg-teal-700 transition duration-200 text-sm font-medium">Übernehmen</button>
                </div>
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400">Keine Preise verfügbar.</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-4">
          <button type="button" @click="showNewPositionForm = false" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</button>
          <button type="button" @click="savePosition" class="bg-teal-500 dark:bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-600 dark:hover:bg-teal-700 transition duration-200 text-sm font-medium">{{ currentPositionIndex >= 0 ? 'Speichern' : 'Hinzufügen' }}</button>
        </div>
      </div>
    </div>
    <button type="button" @click="toggleNewPositionForm" class="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition duration-200 mb-4 text-sm font-medium">{{ showNewPositionForm ? 'Formular Ausblenden' : 'Neue Position' }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Autocomplete from '~/components/Autocomplete.vue'

const props = defineProps(['rechnung', 'rechnungspositionen', 'allProdukte', 'filteredProdukte', 'rabatte', 'produktSearch', 'rabattSearch', 'editingPositionIndex', 'showNewPositionForm', 'currentPosition', 'currentPositionIndex'])
const emit = defineEmits(['toggleNewPositionForm', 'toggleEditPosition', 'saveEditedPosition', 'deletePosition', 'savePosition', 'selectProdukt', 'searchProdukte', 'selectRabattPosition'])

const activeTab = ref('basic')
const tabs = [
  { id: 'basic', label: 'Basisinformationen' },
  { id: 'categories', label: 'Produktkategorien' },
  { id: 'images', label: 'Produktbilder' },
  { id: 'suppliers', label: 'Lieferanten' },
  { id: 'prices', label: 'Preise' }
]
const selectedProduct = ref(null)

watch(() => props.currentPosition.ProduktID, (newProduktID) => {
  if (newProduktID) {
    const product = props.allProdukte.find(p => p.ProduktID === newProduktID)
    if (product) {
      selectedProduct.value = product
    } else {
      // If not found in allProdukte, it might be in filteredProdukte
      const filteredProduct = props.filteredProdukte.find(p => p.ProduktID === newProduktID)
      if (filteredProduct) {
        selectedProduct.value = filteredProduct
      }
    }
  } else {
    selectedProduct.value = null
  }
})

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('de-DE')
}

function applyPrice(preis) {
  if (preis && preis.Preis) {
    props.currentPosition.EinzelpreisNetto = preis.Preis
  }
}

function toggleNewPositionForm() {
  emit('toggleNewPositionForm')
}

function toggleEditPosition(index) {
  emit('toggleEditPosition', index)
}

function saveEditedPosition(index) {
  emit('saveEditedPosition', index)
}

function deletePosition(index) {
  emit('deletePosition', index)
}

function savePosition() {
  emit('savePosition')
}

function selectProdukt(produkt) {
  emit('selectProdukt', produkt)
}

function searchProdukte(searchTerm) {
  emit('searchProdukte', searchTerm)
}

function selectRabattPosition(rabatt) {
  emit('selectRabattPosition', rabatt)
}
</script>
