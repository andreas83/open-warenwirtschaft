<template>
  <div v-if="activeTab === 'suppliers'" class="space-y-6">
    <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{{ $t('produktForm.suppliers.title') }}</h3>
      <div v-if="lieferantenDetails.length > 0" class="space-y-3 mb-6">
        <div v-for="(detail, index) in lieferantenDetails" :key="detail.LieferantenID || index" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all duration-200 hover:shadow-md dark:hover:shadow-xl">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p><strong>{{ $t('produktForm.suppliers.supplier') }}</strong> {{ lieferanten.find(l => l.LieferantenID === detail.LieferantenID)?.Firmenname || $t('produktForm.suppliers.unknown') }}</p>
            <p v-if="detail.LieferantenArtikelnummer"><strong>{{ $t('produktForm.suppliers.articleNumber') }}</strong> {{ detail.LieferantenArtikelnummer }}</p>
            <p v-if="detail.Lieferzeit"><strong>{{ $t('produktForm.suppliers.deliveryTime') }}</strong> {{ detail.Lieferzeit }}</p>
            <p v-if="detail.Mindestbestellmenge"><strong>{{ $t('produktForm.suppliers.minOrderQuantity') }}</strong> {{ detail.Mindestbestellmenge }}</p>
            <p v-if="detail.PreisBeimLieferanten"><strong>{{ $t('produktForm.suppliers.priceAtSupplier') }}</strong> {{ detail.PreisBeimLieferanten }} {{ detail.WaehrungLieferant || 'EUR' }}</p>
          </div>
          <div class="flex gap-2">
            <button type="button" @click="editLieferantDetail(index)" class="bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800 transition duration-200 text-sm font-medium">{{ $t('produktForm.suppliers.edit') }}</button>
            <button type="button" @click="deleteLieferantDetail(index)" class="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800 transition duration-200 text-sm font-medium">{{ $t('produktForm.suppliers.delete') }}</button>
          </div>
        </div>
      </div>
      <button type="button" @click="addLieferantDetail" class="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition duration-200 mb-4 text-sm font-medium">{{ $t('produktForm.suppliers.newSupplier') }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String,
  lieferantenDetails: Array,
  lieferanten: Array
})

const emit = defineEmits(['addLieferantDetail', 'editLieferantDetail', 'deleteLieferantDetail'])

function addLieferantDetail() {
  emit('addLieferantDetail')
}

function editLieferantDetail(index) {
  emit('editLieferantDetail', index)
}

function deleteLieferantDetail(index) {
  emit('deleteLieferantDetail', index)
}
</script>
