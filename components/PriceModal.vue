<template>
  <div v-if="showPreisModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-xl p-6 w-full max-w-lg">
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">{{ editingPreis ? 'Preis Bearbeiten' : 'Neuer Preis' }}</h3>
      <form @submit.prevent="savePreis" class="space-y-5">
        <div>
          <label for="preisValue" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Preis</label>
          <input id="preisValue" v-model="currentPreis.Preis" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
        </div>
        <div>
          <label for="waehrung" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Währung</label>
          <input id="waehrung" v-model="currentPreis.Waehrung" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="z.B. EUR" required>
        </div>
        <div>
          <label for="gueltigAb" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Gültig ab</label>
          <input id="gueltigAb" v-model="currentPreis.GueltigAb" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
        </div>
        <div>
          <label for="gueltigBis" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Gültig bis (optional)</label>
          <input id="gueltigBis" v-model="currentPreis.GueltigBis" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        </div>
        <div>
          <label for="preisTyp" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Preis Typ</label>
          <select id="preisTyp" v-model="currentPreis.PreisTyp" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <option value="Standard">Standard</option>
            <option value="Aktion">Aktion</option>
            <option value="Kundenpreis">Kundenpreis</option>
          </select>
        </div>
        <div>
          <label for="standort" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Standort (optional)</label>
          <Autocomplete
            id="standort"
            :items="standorte"
            id-key="StandortID"
            :display-fn="item => `${item.Name} (ID: ${item.StandortID})`"
            :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase())"
            :initial-value="standortSearch"
            placeholder="Standort suchen..."
            @select="selectStandort"
          />
        </div>
        <div>
          <label for="kundengruppe" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Kundengruppe (optional)</label>
          <Autocomplete
            id="kundengruppe"
            :items="kundengruppen"
            id-key="KundengruppeID"
            :display-fn="item => `${item.Name} (ID: ${item.KundengruppeID})`"
            :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase())"
            :initial-value="kundengruppeSearch"
            placeholder="Kundengruppe suchen..."
            @select="selectKundengruppe"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button type="button" @click="closePreisModal" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</button>
          <button type="submit" class="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 text-sm font-medium">Speichern</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import Autocomplete from '~/components/Autocomplete.vue'

defineProps({
  showPreisModal: Boolean,
  editingPreis: Boolean,
  currentPreis: Object,
  standorte: Array,
  kundengruppen: Array,
  standortSearch: String,
  kundengruppeSearch: String
})

const emit = defineEmits(['closePreisModal', 'savePreis', 'selectStandort', 'selectKundengruppe'])

function closePreisModal() {
  emit('closePreisModal')
}

function savePreis() {
  emit('savePreis')
}

function selectStandort(standort) {
  emit('selectStandort', standort)
}

function selectKundengruppe(gruppe) {
  emit('selectKundengruppe', gruppe)
}
</script>
