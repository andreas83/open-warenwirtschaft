<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="rechnungsnummer" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rechnungsnummer</label>
        <input id="rechnungsnummer" v-model="rechnung.Rechnungsnummer" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" :required="mode === 'edit'">
      </div>
      <div>
        <label for="rechnungsdatum" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rechnungsdatum</label>
        <input id="rechnungsdatum" v-model="rechnung.Rechnungsdatum" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="faelligkeitsdatum" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Fälligkeitsdatum</label>
        <input id="faelligkeitsdatum" v-model="rechnung.Faelligkeitsdatum" type="date" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
      </div>
      <div>
        <label for="kunden" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Kunde</label>
        <Autocomplete
          id="kunden"
          :items="kunden"
          id-key="KundenID"
          :display-fn="item => item.Firmenname ? item.Firmenname : `${item.Vorname || ''} ${item.Nachname || ''}`"
          :filter-fn="(item, search) => (item.Firmenname && item.Firmenname.toLowerCase().includes(search.toLowerCase())) || `${item.Vorname || ''} ${item.Nachname || ''}`.toLowerCase().includes(search.toLowerCase())"
          :initial-value="kundenSearch"
          placeholder="Kunde suchen..."
          @select="selectKunde"
        />
      </div>
    </div>
    <div>
      <label for="rechnungsadresse" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rechnungsadresse</label>
      <textarea id="rechnungsadresse" v-model="rechnung.Rechnungsadresse" rows="3" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="zahlungsstatus" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Zahlungsstatus</label>
        <select id="zahlungsstatus" v-model="rechnung.Zahlungsstatus" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
          <option value="Offen">Offen</option>
          <option value="Teilbezahlt">Teilbezahlt</option>
          <option value="Bezahlt">Bezahlt</option>
          <option value="Überfällig">Überfällig</option>
          <option value="Storniert">Storniert</option>
        </select>
      </div>
      <div>
        <label for="waehrung" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Währung</label>
        <input id="waehrung" v-model="rechnung.Waehrung" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="z.B. EUR" required>
      </div>
    </div>
    <div>
      <label for="kommentare" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Kommentare</label>
      <textarea id="kommentare" v-model="rechnung.Kommentare" rows="3" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
    </div>
  </div>
</template>

<script setup>
import Autocomplete from '~/components/Autocomplete.vue'

const props = defineProps(['rechnung', 'kunden', 'kundenSearch', 'mode'])
const emit = defineEmits(['selectKunde'])

function selectKunde(kunde) {
  emit('selectKunde', kunde)
}
</script>
