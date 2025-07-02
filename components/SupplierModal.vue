<template>
  <div v-if="showLieferantModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-xl p-6 w-full max-w-lg">
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-200 mb-4">{{ editingLieferant ? 'Lieferant Bearbeiten' : 'Neuer Lieferant' }}</h3>
      <form @submit.prevent="saveLieferantDetail" class="space-y-5">
        <div>
          <label for="lieferantSelect" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Lieferant</label>
          <Autocomplete
            id="lieferantSelect"
            :items="lieferanten"
            id-key="LieferantenID"
            :display-fn="item => `${item.Firmenname}`"
            :filter-fn="(item, search) => item.Firmenname.toLowerCase().includes(search.toLowerCase())"
            :initial-value="lieferantSearch"
            placeholder="Lieferant suchen..."
            @select="selectLieferant"
          />
        </div>
        <div>
          <label for="lieferantenArtikelnummer" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Artikelnummer beim Lieferanten (optional)</label>
          <input id="lieferantenArtikelnummer" v-model="currentLieferantDetail.LieferantenArtikelnummer" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        </div>
        <div>
          <label for="lieferzeit" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Lieferzeit in Tagen (optional)</label>
          <input id="lieferzeit" v-model="currentLieferantDetail.Lieferzeit" type="number" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        </div>
        <div>
          <label for="mindestbestellmenge" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Mindestbestellmenge (optional)</label>
          <input id="mindestbestellmenge" v-model="currentLieferantDetail.Mindestbestellmenge" type="number" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        </div>
        <div>
          <label for="preisBeimLieferanten" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Preis beim Lieferanten (optional)</label>
          <input id="preisBeimLieferanten" v-model="currentLieferantDetail.PreisBeimLieferanten" type="number" step="0.01" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        </div>
        <div>
          <label for="waehrungLieferant" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Währung beim Lieferanten</label>
          <input id="waehrungLieferant" v-model="currentLieferantDetail.WaehrungLieferant" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="z.B. EUR" required>
        </div>
        <div class="flex justify-end space-x-3">
          <button type="button" @click="closeLieferantModal" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</button>
          <button type="submit" class="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 text-sm font-medium">Speichern</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import Autocomplete from '~/components/Autocomplete.vue'

defineProps({
  showLieferantModal: Boolean,
  editingLieferant: Boolean,
  currentLieferantDetail: Object,
  lieferanten: Array,
  lieferantSearch: String
})

const emit = defineEmits(['closeLieferantModal', 'saveLieferantDetail', 'selectLieferant'])

function closeLieferantModal() {
  emit('closeLieferantModal')
}

function saveLieferantDetail() {
  emit('saveLieferantDetail')
}

function selectLieferant(lieferant) {
  emit('selectLieferant', lieferant)
}
</script>
