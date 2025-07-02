<template>
  <div v-if="activeTab === 'basic'" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="produktname" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.productName') }}</label>
        <input id="produktname" v-model="produkt.Produktname" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
      </div>
      <div>
        <label for="artikelnummer" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.articleNumber') }}</label>
        <input id="artikelnummer" v-model="produkt.Artikelnummer" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" :required="mode === 'edit'">
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="eanCode" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.eanCode') }}</label>
        <input id="eanCode" v-model="produkt.EAN_Code" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
      </div>
      <div>
        <label for="hersteller" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.manufacturer') }}</label>
        <input id="hersteller" v-model="produkt.Hersteller" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
      </div>
    </div>
    <div>
      <label for="beschreibung" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.description') }}</label>
      <textarea id="beschreibung" v-model="produkt.Beschreibung" rows="3" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="gewicht" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.weight') }}</label>
        <input id="gewicht" v-model="produkt.Gewicht" type="number" step="0.001" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
      </div>
      <div>
        <label for="volumen" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.volume') }}</label>
        <input id="volumen" v-model="produkt.Volumen" type="number" step="0.001" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="einheit" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.unit') }}</label>
        <Autocomplete
          id="einheit"
          :items="einheiten"
          id-key="EinheitID"
          :display-fn="item => `${item.Name} (${item.Symbol})`"
          :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase()) || item.Symbol.toLowerCase().includes(search.toLowerCase())"
          :initial-value="einheitSearch"
          :placeholder="$t('produktForm.basicInfo.searchUnitPlaceholder')"
          @select="selectEinheit"
        />
      </div>
      <div>
        <label for="umsatzsteuersatz" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.vatRate') }}</label>
        <Autocomplete
          id="umsatzsteuersatz"
          :items="umsatzsteuersaetze"
          id-key="UmsatzsteuersatzID"
          :display-fn="item => `${item.Name} (${item.Steuersatz}%)`"
          :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase()) || item.Steuersatz.toString().includes(search)"
          :initial-value="umsatzsteuersatzSearch"
          :placeholder="$t('produktForm.basicInfo.searchVatRatePlaceholder')"
          @select="selectUmsatzsteuersatz"
        />
      </div>
    </div>
    <div>
      <label for="kategorien" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.basicInfo.categories') }}</label>
      <div class="border border-gray-200 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 max-h-40 overflow-y-auto">
        <div v-if="kategorien.length === 0" class="text-gray-500 dark:text-gray-400">{{ $t('produktForm.basicInfo.noCategories') }}</div>
        <div v-else v-for="kategorie in kategorien" :key="kategorie.KategorieID" class="flex items-center mb-2">
          <input
            type="checkbox"
            :id="'kategorie-' + kategorie.KategorieID"
            :value="kategorie.KategorieID"
            :checked="selectedKategorien.includes(kategorie.KategorieID)"
            @change="updateSelectedKategorien($event, kategorie.KategorieID)"
            class="mr-2"
          >
          <label :for="'kategorie-' + kategorie.KategorieID" class="cursor-pointer">{{ kategorie.Name }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Autocomplete from '~/components/Autocomplete.vue'

defineProps({
  activeTab: String,
  produkt: Object,
  mode: String,
  einheiten: Array,
  umsatzsteuersaetze: Array,
  kategorien: Array,
  selectedKategorien: Array,
  einheitSearch: String,
  umsatzsteuersatzSearch: String
})

const emit = defineEmits(['selectEinheit', 'selectUmsatzsteuersatz', 'update:selectedKategorien'])

function selectEinheit(einheit) {
  emit('selectEinheit', einheit)
}

function selectUmsatzsteuersatz(satz) {
  emit('selectUmsatzsteuersatz', satz)
}

function updateSelectedKategorien(event, kategorieId) {
  const updatedKategorien = [...selectedKategorien];
  if (event.target.checked) {
    if (!updatedKategorien.includes(kategorieId)) {
      updatedKategorien.push(kategorieId);
    }
  } else {
    const index = updatedKategorien.indexOf(kategorieId);
    if (index !== -1) {
      updatedKategorien.splice(index, 1);
    }
  }
  emit('update:selectedKategorien', updatedKategorien);
}
</script>
