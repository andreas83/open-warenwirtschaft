<template>
  <div v-if="activeTab === 'prices'" class="space-y-6">
    <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{{ $t('produktForm.prices.title') }}</h3>
      <div v-if="preise.length > 0" class="space-y-3 mb-6">
        <div v-for="(preis, index) in preise" :key="preis.PreisID || index" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all duration-200 hover:shadow-md dark:hover:shadow-xl">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>{{ $t('produktForm.prices.price') }}</strong> {{ typeof preis.Preis === 'number' ? preis.Preis.toFixed(2) : preis.Preis }} {{ preis.Waehrung }}</p>
            <p><strong>{{ $t('produktForm.prices.validFrom') }}</strong> {{ formatDate(preis.GueltigAb) }}</p>
            <p v-if="preis.GueltigBis"><strong>{{ $t('produktForm.prices.validTo') }}</strong> {{ formatDate(preis.GueltigBis) }}</p>
            <p><strong>{{ $t('produktForm.prices.type') }}</strong> {{ preis.PreisTyp }}</p>
            <p v-if="preis.StandortID"><strong>{{ $t('produktForm.prices.location') }}</strong> {{ standorte.find(s => s.StandortID === preis.StandortID)?.Name || $t('produktForm.prices.unknown') }}</p>
            <p v-if="preis.KundengruppeID"><strong>{{ $t('produktForm.prices.customerGroup') }}</strong> {{ preis.KundengruppeID }}</p>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="editPreis(index)" class="bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800 transition duration-200 text-sm font-medium">{{ $t('produktForm.prices.edit') }}</button>
            <button type="button" @click="deletePreis(index)" class="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800 transition duration-200 text-sm font-medium">{{ $t('produktForm.prices.delete') }}</button>
          </div>
        </div>
      </div>
      <button type="button" @click="addPreis" class="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition duration-200 mb-4 text-sm font-medium">{{ $t('produktForm.prices.newPrice') }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String,
  preise: Array,
  standorte: Array
})

const emit = defineEmits(['addPreis', 'editPreis', 'deletePreis'])

function addPreis() {
  emit('addPreis')
}

function editPreis(index) {
  emit('editPreis', index)
}

function deletePreis(index) {
  emit('deletePreis', index)
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('de-DE')
}
</script>
