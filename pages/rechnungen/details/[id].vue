<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Rechnungsdetails</h2>
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">
      <div class="i-svg-spinners:blocks-wave inline-block" />
      Lade Rechnung...
    </div>
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 max-w-5xl mx-auto">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Rechnungsnummer</p>
              <p class="text-gray-900 dark:text-gray-100 font-medium">{{ rechnung.Rechnungsnummer }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Rechnungsdatum</p>
              <p class="text-gray-900 dark:text-gray-100 font-medium">{{ formatDate(rechnung.Rechnungsdatum) }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Fälligkeitsdatum</p>
              <p class="text-gray-900 dark:text-gray-100 font-medium">{{ formatDate(rechnung.Faelligkeitsdatum) }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Zahlungsstatus</p>
              <p :class="getStatusClass(rechnung.Zahlungsstatus)" class="font-medium">{{ rechnung.Zahlungsstatus }}</p>
            </div>
          </div>
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Kunde</p>
            <p class="text-gray-900 dark:text-gray-100 font-medium">{{ getKundenName(rechnung) }}</p>
          </div>
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Rechnungsadresse</p>
            <p class="text-gray-900 dark:text-gray-100 font-medium whitespace-pre-line">{{ rechnung.Rechnungsadresse || 'Keine Adresse angegeben' }}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-gray-500 dark:text-gray-400 text-sm">Währung</p>
              <p class="text-gray-900 dark:text-gray-100 font-medium">{{ rechnung.Waehrung || 'EUR' }}</p>
            </div>
          </div>
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Kommentare</p>
            <p class="text-gray-900 dark:text-gray-100 font-medium whitespace-pre-line">{{ rechnung.Kommentare || 'Keine Kommentare' }}</p>
          </div>
          
          <!-- Rechnungspositionen Section -->
          <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Rechnungspositionen</h3>
            <div v-if="rechnung.Rechnungspositionen && rechnung.Rechnungspositionen.length > 0" class="mb-6 overflow-x-auto">
              <table class="min-w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg">
                <thead class="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Produkt</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Menge</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Einzelpreis Netto</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rabatt</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Gesamt Netto</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">MwSt. Satz</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Beschreibung</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(position, index) in rechnung.Rechnungspositionen" :key="position.RechnungspositionsID || index" class="border-b border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ getProduktName(position.ProduktID) }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ position.Menge }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ Number(position.EinzelpreisNetto).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ position.RabattBetragPosition ? Number(position.RabattBetragPosition).toFixed(2) : '0.00' }} {{ rechnung.Waehrung || 'EUR' }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ Number(position.GesamtpreisNettoPosition).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ position.MwSt_Satz }}%</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ position.Beschreibung || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-gray-500 dark:text-gray-400 py-4">
              Keine Rechnungspositionen vorhanden.
            </div>
          </div>
          
          <!-- RechnungsRabatte Section -->
          <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">RechnungsRabatte</h3>
            <div v-if="rechnung.RechnungsRabatte && rechnung.RechnungsRabatte.length > 0" class="space-y-3 mb-6">
              <div v-for="(rabatt, index) in rechnung.RechnungsRabatte" :key="rabatt.RechnungsRabattID || index" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Rabatt:</strong> {{ getRabattName(rabatt.RabattID) }}</p>
                  <p><strong>Angewendeter Betrag:</strong> {{ Number(rabatt.AngewendeterBetrag).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</p>
                  <p v-if="rabatt.AngewendeterWert"><strong>Angewendeter Wert:</strong> {{ rabatt.AngewendeterWert }}%</p>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 dark:text-gray-400 py-4">
              Keine RechnungsRabatte vorhanden.
            </div>
          </div>
          
          <!-- Totals Section -->
          <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Zusammenfassung</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Gesamtbetrag Netto</p>
                <p class="text-gray-900 dark:text-gray-100 font-medium">{{ Number(rechnung.GesamtbetragNetto).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</p>
              </div>
              <div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">MwSt. Gesamt</p>
                <p class="text-gray-900 dark:text-gray-100 font-medium">{{ Number(rechnung.MwSt_Gesamt).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</p>
              </div>
              <div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Gesamtrabatt Betrag</p>
                <p class="text-gray-900 dark:text-gray-100 font-medium">{{ Number(rechnung.GesamtrabattBetrag).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</p>
              </div>
              <div>
                <p class="text-gray-500 dark:text-gray-400 text-sm">Gesamtbetrag Brutto</p>
                <p class="text-gray-900 dark:text-gray-100 text-lg font-bold">{{ Number(rechnung.GesamtbetragBrutto).toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-6">
            <NuxtLink to="/rechnungen" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Zurück zur Liste</NuxtLink>
            <NuxtLink :to="`/rechnungen/edit/${rechnung.RechnungsID}`" class="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 text-sm font-medium">Bearbeiten</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from '#app'

const route = useRoute()
const rechnungId = route.params.id
const rechnung = ref({})
const loading = ref(true)
const error = ref(null)

async function fetchRechnung() {
  try {
    loading.value = true
    const response = await $fetch(`/api/rechnungen?id=${rechnungId}`)
    if (response.status === 404) {
      error.value = 'Rechnung nicht gefunden'
    } else {
      rechnung.value = response
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Rechnung: ' + err.message
  } finally {
    loading.value = false
  }
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('de-DE')
}

function getKundenName(rechnung) {
  if (rechnung.Kunden) {
    if (rechnung.Kunden.Firmenname) return rechnung.Kunden.Firmenname
    return `${rechnung.Kunden.Vorname || ''} ${rechnung.Kunden.Nachname || ''}`.trim() || 'Unbekannt'
  }
  return 'Unbekannt'
}

function getProduktName(produktId) {
  if (rechnung.value && rechnung.value.Rechnungspositionen) {
    const produkt = rechnung.value.Rechnungspositionen.find(pos => pos.ProduktID === produktId)?.Produkte
    return produkt ? produkt.Produktname : 'Unbekannt'
  }
  return 'Unbekannt'
}

function getRabattName(rabattId) {
  if (rechnung.value && rechnung.value.RechnungsRabatte) {
    const rabatt = rechnung.value.RechnungsRabatte.find(r => r.RabattID === rabattId)?.Rabatte
    return rabatt ? rabatt.Name : 'Unbekannt'
  }
  return 'Unbekannt'
}

function getStatusClass(status) {
  switch (status) {
    case 'Bezahlt':
      return 'text-green-600 dark:text-green-400'
    case 'Offen':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'Überfällig':
      return 'text-red-600 dark:text-red-400'
    case 'Teilbezahlt':
      return 'text-orange-600 dark:text-orange-400'
    case 'Storniert':
      return 'text-gray-500 dark:text-gray-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

onMounted(() => {
  fetchRechnung()
})
</script>
