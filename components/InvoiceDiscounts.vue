<template>
  <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
    <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">RechnungsRabatte</h3>
    <div v-if="rechnungsRabatte.length > 0" class="space-y-3 mb-6">
      <div v-for="(rabatt, index) in rechnungsRabatte" :key="rabatt.RechnungsRabattID || index" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all duration-200 hover:shadow-md dark:hover:shadow-xl">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Rabatt:</strong> {{ rabatte.find(r => r.RabattID === rabatt.RabattID)?.Name || 'Unbekannt' }}</p>
          <p><strong>Angewendeter Betrag:</strong> {{ rabatt.AngewendeterBetrag.toFixed(2) }} {{ rechnung.Waehrung || 'EUR' }}</p>
          <p v-if="rabatt.AngewendeterWert"><strong>Angewendeter Wert:</strong> {{ rabatt.AngewendeterWert }}%</p>
        </div>
        <div class="flex gap-2">
          <button type="button" @click="editRabatt(index)" class="bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-md hover:bg-teal-100 dark:hover:bg-teal-800 transition duration-200 text-sm font-medium">Bearbeiten</button>
          <button type="button" @click="deleteRabatt(index)" class="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800 transition duration-200 text-sm font-medium">Löschen</button>
        </div>
      </div>
    </div>
    <button type="button" @click="addRabatt" class="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition duration-200 mb-4 text-sm font-medium">Neuer Rabatt</button>
  </div>

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
</template>

<script setup>
import Autocomplete from '~/components/Autocomplete.vue'

const props = defineProps(['rechnung', 'rechnungsRabatte', 'rabatte', 'showRabattModal', 'editingRabatt', 'currentRabatt', 'rabattRabattSearch'])
const emit = defineEmits(['addRabatt', 'editRabatt', 'deleteRabatt', 'closeRabattModal', 'saveRabatt', 'selectRabatt'])

function addRabatt() {
  emit('addRabatt')
}

function editRabatt(index) {
  emit('editRabatt', index)
}

function deleteRabatt(index) {
  emit('deleteRabatt', index)
}

function closeRabattModal() {
  emit('closeRabattModal')
}

function saveRabatt() {
  emit('saveRabatt')
}

function selectRabatt(rabatt) {
  emit('selectRabatt', rabatt)
}
</script>
