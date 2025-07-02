<template>
  <div v-if="activeTab === 'images'" class="space-y-6">
    <div class="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">{{ $t('produktForm.images.title') }}</h3>
      <div v-if="produktBilder.length > 0 || imagePreviews.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div v-for="(bild, index) in produktBilder" :key="bild.BildID" class="relative group">
          <img :src="bild.BildPfad" alt="Produktbild" class="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600">
          <div v-if="bild.IstHauptbild" class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">{{ $t('produktForm.images.mainImage') }}</div>
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
            <button type="button" @click="setHauptbild(index)" class="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2 text-xs" :disabled="bild.IstHauptbild">{{ $t('produktForm.images.setAsMain') }}</button>
            <button type="button" @click="deleteProduktBild(index)" class="bg-red-500 text-white px-2 py-1 rounded-md text-xs">{{ $t('produktForm.images.delete') }}</button>
          </div>
        </div>
        <div v-for="(preview, index) in imagePreviews" :key="index" class="relative group">
          <img :src="preview" alt="Vorschau" class="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-600">
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
            <button type="button" @click="removeImagePreview(index)" class="bg-red-500 text-white px-2 py-1 rounded-md text-xs">{{ $t('produktForm.images.remove') }}</button>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label for="imageUpload" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">{{ $t('produktForm.images.uploadNew') }}</label>
        <input id="imageUpload" type="file" accept="image/*" multiple @change="handleImageUpload" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: String,
  produktBilder: Array,
  imagePreviews: Array
})

const emit = defineEmits(['setHauptbild', 'deleteProduktBild', 'removeImagePreview', 'handleImageUpload'])

function setHauptbild(index) {
  emit('setHauptbild', index)
}

function deleteProduktBild(index) {
  emit('deleteProduktBild', index)
}

function removeImagePreview(index) {
  emit('removeImagePreview', index)
}

function handleImageUpload(event) {
  emit('handleImageUpload', event)
}
</script>
