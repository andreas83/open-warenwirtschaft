<template>
  <div v-if="activeTab === 'prices'" class="space-y-6">
    <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{{ $t('produktForm.prices.title') }}</h3>
      <div v-if="preise.length > 0" class="overflow-x-auto mb-6">
        <table class="min-w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg">
          <thead class="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('produktForm.prices.price') }}</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('produktForm.prices.validFrom') }}</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('produktForm.prices.validTo') }}</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('produKtForm.prices.type') }}</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('produktForm.prices.location') }}</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('produktForm.prices.customerGroup') }}</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('produktForm.prices.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-600">
            <tr v-for="(preis, index) in preise" :key="preis.PreisID || index" :class="{
              'bg-yellow-50 dark:bg-yellow-900': preis.PreisTyp === 'Aktion',
              'bg-blue-50 dark:bg-blue-900': preis.PreisTyp === 'Kundenpreis',
              'opacity-50': isExpired(preis.GueltigBis)
            }" class="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
              <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ typeof preis.Preis === 'number' ? preis.Preis.toFixed(2) : preis.Preis }} {{ preis.Waehrung }}</td>
              <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(preis.GueltigAb) }}</td>
              <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ formatDate(preis.GueltigBis) }}</td>
              <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ preis.PreisTyp }}</td>
              <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ preis.StandortID ? (standorte.find(s => s.StandortID === preis.StandortID)?.Name || $t('produktForm.prices.unknown')) : '-' }}</td>
              <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ preis.KundengruppeID || '-' }}</td>
              <td class="px-4 py-2 text-sm">
                <div class="flex gap-2">
                  <button type="button" @click="editPreis(index)" class="bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800 transition duration-200 text-sm font-medium">{{ $t('produktForm.prices.edit') }}</button>
                  <button type="button" @click="deletePreis(index)" class="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800 transition duration-200 text-sm font-medium">{{ $t('produktForm.prices.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

function isExpired(gueltigBis) {
  if (!gueltigBis) return false
  return new Date(gueltigBis) < new Date()
}
</script>
