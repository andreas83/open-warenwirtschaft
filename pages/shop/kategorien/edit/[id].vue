<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ t('shop.categories.editCategory') }}</h1>
        <p class="text-gray-600 mt-1">{{ t('shop.categories.editSubtitle') }}</p>
      </div>
      <NuxtLink
        to="/shop/kategorien"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-arrow-left text-xl"></span>
        {{ t('common.back') }}
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <form v-else @submit.prevent="saveCategory" class="bg-white rounded-lg shadow-md p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.categories.name') }} *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Slug -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.categories.slug') }} *
          </label>
          <input
            v-model="form.slug"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Description -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.categories.description') }}
          </label>
          <textarea
            v-model="form.beschreibung"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <!-- Parent Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.categories.parent') }}
          </label>
          <select
            v-model="form.uebergeordneteKategorieID"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option :value="null">{{ t('shop.categories.noParent') }}</option>
            <option
              v-for="cat in availableParents"
              :key="cat.ShopKategorieID"
              :value="cat.ShopKategorieID"
            >
              {{ cat.Name }}
            </option>
          </select>
        </div>

        <!-- Sort Order -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shop.categories.sortOrder') }}
          </label>
          <input
            v-model.number="form.sortOrder"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Visibility -->
        <div class="flex items-center">
          <input
            v-model="form.istSichtbar"
            type="checkbox"
            id="istSichtbar"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="istSichtbar" class="ml-2 text-sm text-gray-700">
            {{ t('shop.categories.isVisible') }}
          </label>
        </div>
      </div>

      <!-- SEO Section -->
      <div class="border-t border-gray-200 mt-6 pt-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">{{ t('shop.categories.seo') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('shop.categories.metaTitle') }}
            </label>
            <input
              v-model="form.metaTitel"
              type="text"
              maxlength="60"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">{{ form.metaTitel?.length || 0 }}/60</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('shop.categories.metaDescription') }}
            </label>
            <textarea
              v-model="form.metaBeschreibung"
              rows="2"
              maxlength="160"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ form.metaBeschreibung?.length || 0 }}/160</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
        <NuxtLink
          to="/shop/kategorien"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
        >
          {{ t('common.cancel') }}
        </NuxtLink>
        <button
          type="submit"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="saving" class="i-mdi-loading animate-spin"></span>
          {{ t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const categoryId = computed(() => parseInt(route.params.id))
const loading = ref(true)
const saving = ref(false)
const categories = ref([])

const form = ref({
  name: '',
  slug: '',
  beschreibung: '',
  uebergeordneteKategorieID: null,
  sortOrder: 0,
  istSichtbar: true,
  metaTitel: '',
  metaBeschreibung: ''
})

// Filter out the current category and its children to prevent circular references
const availableParents = computed(() => {
  return categories.value.filter(cat => cat.ShopKategorieID !== categoryId.value)
})

const loadCategory = async () => {
  loading.value = true
  try {
    const category = await $fetch(`/api/shop/kategorien?id=${categoryId.value}`)
    form.value = {
      name: category.Name,
      slug: category.Slug,
      beschreibung: category.Beschreibung || '',
      uebergeordneteKategorieID: category.UebergeordneteKategorieID,
      sortOrder: category.SortOrder || 0,
      istSichtbar: category.IstSichtbar,
      metaTitel: category.MetaTitel || '',
      metaBeschreibung: category.MetaBeschreibung || ''
    }
  } catch (error) {
    toast.error(t('common.error'))
    router.push('/shop/kategorien')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const data = await $fetch('/api/shop/kategorien', { params: { limit: 1000 } })
    categories.value = data.categories
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const saveCategory = async () => {
  saving.value = true
  try {
    await $fetch(`/api/shop/kategorien?id=${categoryId.value}`, {
      method: 'PUT',
      body: {
        Name: form.value.name,
        Slug: form.value.slug,
        Beschreibung: form.value.beschreibung || null,
        UebergeordneteKategorieID: form.value.uebergeordneteKategorieID,
        SortOrder: form.value.sortOrder,
        IstSichtbar: form.value.istSichtbar,
        MetaTitel: form.value.metaTitel || null,
        MetaBeschreibung: form.value.metaBeschreibung || null
      }
    })
    toast.success(t('shop.categories.updateSuccess'))
    router.push('/shop/kategorien')
  } catch (error) {
    toast.error(error.data?.message || t('common.error'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadCategory()])
})
</script>
