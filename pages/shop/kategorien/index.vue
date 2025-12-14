<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ t('shop.categories.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ t('shop.categories.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/shop/kategorien/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-plus text-xl"></span>
        {{ t('shop.categories.newCategory') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('common.search') }}
          </label>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('shop.categories.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debounceSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.categories.visibility') }}
          </label>
          <select
            v-model="filterSichtbar"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadCategories"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="true">{{ t('shop.categories.visible') }}</option>
            <option value="false">{{ t('shop.categories.hidden') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Categories Table -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.categories.name') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.categories.slug') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.categories.parent') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.categories.products') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('shop.categories.subcategories') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('common.status') }}
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="category in categories" :key="category.ShopKategorieID" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <div v-if="category.BildPfad" class="h-10 w-10 flex-shrink-0 mr-3">
                  <img :src="category.BildPfad" :alt="category.Name" class="h-10 w-10 rounded object-cover" />
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ category.Name }}</div>
                  <div v-if="category.Beschreibung" class="text-sm text-gray-500 line-clamp-1">
                    {{ category.Beschreibung }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <code class="bg-gray-100 px-2 py-1 rounded">{{ category.Slug }}</code>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ category.ShopKategorien?.Name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ category._count.ShopProdukte }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ category._count.other_ShopKategorien }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="category.IstSichtbar ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ category.IstSichtbar ? t('shop.categories.visible') : t('shop.categories.hidden') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <NuxtLink
                :to="`/shop/kategorien/edit/${category.ShopKategorieID}`"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                {{ t('common.edit') }}
              </NuxtLink>
              <button
                @click="deleteCategory(category.ShopKategorieID)"
                class="text-red-600 hover:text-red-900"
              >
                {{ t('common.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && categories.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
      <span class="i-mdi-folder-outline text-6xl text-gray-400 mb-4"></span>
      <p class="text-gray-500 text-lg">{{ t('shop.categories.noCategories') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="mt-6 flex justify-center gap-2">
      <button
        @click="goToPage(0)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.first') }}
      </button>
      <button
        @click="goToPage(offset - limit)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.previous') }}
      </button>
      <span class="px-3 py-1">
        {{ Math.floor(offset / limit) + 1 }} / {{ Math.ceil(total / limit) }}
      </span>
      <button
        @click="goToPage(offset + limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.next') }}
      </button>
      <button
        @click="goToPage(Math.floor(total / limit) * limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ t('pagination.last') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const loading = ref(true)
const categories = ref([])
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const searchQuery = ref('')
const filterSichtbar = ref('')
let debounceTimer = null

const loadCategories = async () => {
  loading.value = true
  try {
    const params = {
      limit: limit.value,
      offset: offset.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (filterSichtbar.value) params.istSichtbar = filterSichtbar.value

    const data = await $fetch('/api/shop/kategorien', { params })
    categories.value = data.categories
    total.value = data.total
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    offset.value = 0
    loadCategories()
  }, 300)
}

const goToPage = (newOffset) => {
  offset.value = newOffset
  loadCategories()
}

const deleteCategory = async (id) => {
  if (!confirm(t('shop.categories.confirmDelete'))) return

  try {
    await $fetch(`/api/shop/kategorien?id=${id}`, { method: 'DELETE' })
    await loadCategories()
  } catch (error) {
    alert(error.data?.message || t('common.error'))
  }
}

onMounted(() => {
  loadCategories()
})
</script>
