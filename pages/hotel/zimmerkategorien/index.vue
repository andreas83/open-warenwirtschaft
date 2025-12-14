<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ t('hotel.categories.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ t('hotel.categories.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/hotel/zimmerkategorien/create"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-plus text-xl"></span>
        {{ t('hotel.categories.newCategory') }}
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Categories Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="category in categories"
        :key="category.ZimmerkategorieID"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200"
      >
        <div v-if="category.BildURL" class="h-48 bg-gray-200">
          <img :src="category.BildURL" :alt="category.Name" class="w-full h-full object-cover" />
        </div>
        <div v-else class="h-48 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
          <span class="i-mdi-bed text-6xl text-white opacity-50"></span>
        </div>

        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-semibold text-gray-800">{{ category.Name }}</h3>
            <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="category.IstAktiv ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
              {{ category.IstAktiv ? t('common.active') : t('common.inactive') }}
            </span>
          </div>

          <p v-if="category.Beschreibung" class="text-sm text-gray-600 mb-3 line-clamp-2">
            {{ category.Beschreibung }}
          </p>

          <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div class="flex items-center gap-1">
              <span class="i-mdi-account-group"></span>
              <span>{{ category.MaxPersonen }} {{ t('hotel.categories.persons') }}</span>
            </div>
            <div v-if="category.Groesse" class="flex items-center gap-1">
              <span class="i-mdi-ruler"></span>
              <span>{{ category.Groesse }} m²</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-gray-200">
            <div class="text-lg font-bold text-indigo-600">
              € {{ parseFloat(category.Grundpreis).toFixed(2) }} <span class="text-xs text-gray-500">/ {{ t('hotel.categories.night') }}</span>
            </div>
            <div class="text-sm text-gray-500">
              {{ category._count?.Zimmer || 0 }} {{ t('hotel.categories.rooms') }}
            </div>
          </div>

          <div class="mt-3 flex gap-2">
            <NuxtLink
              :to="`/hotel/zimmerkategorien/edit/${category.ZimmerkategorieID}`"
              class="flex-1 px-3 py-2 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700 transition duration-200 text-sm"
            >
              {{ t('common.edit') }}
            </NuxtLink>
            <button
              @click="deleteCategory(category.ZimmerkategorieID)"
              class="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-sm"
            >
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && categories.length === 0" class="text-center py-12">
      <span class="i-mdi-bed text-6xl text-gray-300 mb-4"></span>
      <p class="text-gray-500 text-lg">{{ t('hotel.categories.noCategories') }}</p>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const loading = ref(true)
const categories = ref([])

onMounted(() => {
  loadCategories()
})

async function loadCategories() {
  loading.value = true
  try {
    const response = await $fetch('/api/hotel/zimmerkategorien')
    categories.value = response.categories || []
  } catch (error) {
    console.error('Error loading categories:', error)
    alert(t('hotel.categories.errorLoading'))
  } finally {
    loading.value = false
  }
}

async function deleteCategory(id) {
  if (!confirm(t('hotel.categories.confirmDelete'))) return

  try {
    await $fetch(`/api/hotel/zimmerkategorien?id=${id}`, { method: 'DELETE' })
    await loadCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
    alert(error.data?.message || t('hotel.categories.errorDeleting'))
  }
}
</script>
