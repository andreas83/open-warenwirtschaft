<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ t('restaurant.tables.editTable') }}</h1>
        <p class="text-gray-600 mt-1">{{ t('restaurant.tables.editSubtitle') }}</p>
      </div>

      <div v-if="loading" class="bg-white rounded-lg shadow-md p-6 text-center">
        <div class="i-svg-spinners-blocks-wave w-8 h-8 mx-auto text-blue-500"></div>
        <p class="mt-2 text-gray-600">{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="bg-white rounded-lg shadow-md p-6 text-center text-red-600">
        {{ error }}
      </div>

      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="saveTable">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('restaurant.tables.tableNumber') }} *
              </label>
              <input
                v-model="form.Tischnummer"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="t('restaurant.tables.tableNumberPlaceholder')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('restaurant.tables.section') }}
              </label>
              <select
                v-model="form.BereichID"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="null">{{ t('common.none') }}</option>
                <option v-for="section in sections" :key="section.BereichID" :value="section.BereichID">
                  {{ section.Name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('restaurant.tables.capacity') }} *
              </label>
              <input
                v-model.number="form.Kapazitaet"
                type="number"
                required
                min="1"
                max="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('common.status') }}
              </label>
              <select
                v-model="form.Status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Verfuegbar">{{ t('restaurant.tables.status.available') }}</option>
                <option value="Besetzt">{{ t('restaurant.tables.status.occupied') }}</option>
                <option value="Reserviert">{{ t('restaurant.tables.status.reserved') }}</option>
                <option value="Gesperrt">{{ t('restaurant.tables.status.blocked') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('common.description') }}
              </label>
              <textarea
                v-model="form.Beschreibung"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="t('restaurant.tables.descriptionPlaceholder')"
              ></textarea>
            </div>

            <div class="flex items-center">
              <input
                v-model="form.IstAktiv"
                type="checkbox"
                id="istAktiv"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="istAktiv" class="ml-2 block text-sm text-gray-700">
                {{ t('common.active') }}
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              @click="navigateTo('/restaurant/tische')"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? t('common.saving') : t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
const route = useRoute()

const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const sections = ref([])

const form = ref({
  Tischnummer: '',
  BereichID: null,
  Kapazitaet: 4,
  Status: 'Verfuegbar',
  Beschreibung: '',
  IstAktiv: true
})

const loadSections = async () => {
  try {
    const data = await $fetch('/api/restaurant/tischbereiche')
    sections.value = data.sections || []
  } catch (err) {
    console.error('Error loading sections:', err)
  }
}

const loadTable = async () => {
  try {
    loading.value = true
    const data = await $fetch(`/api/restaurant/tische?id=${route.params.id}`)

    if (data && data.TischID) {
      form.value = {
        Tischnummer: data.Tischnummer || '',
        BereichID: data.BereichID || null,
        Kapazitaet: data.Kapazitaet || 4,
        Status: data.Status || 'Verfuegbar',
        Beschreibung: data.Beschreibung || '',
        IstAktiv: data.IstAktiv !== false
      }
    } else {
      error.value = t('restaurant.tables.notFound')
    }
  } catch (err) {
    console.error('Error loading table:', err)
    error.value = t('common.error')
  } finally {
    loading.value = false
  }
}

const saveTable = async () => {
  saving.value = true
  try {
    await $fetch('/api/restaurant/tische', {
      method: 'PUT',
      body: {
        TischID: parseInt(route.params.id),
        ...form.value
      }
    })
    navigateTo('/restaurant/tische')
  } catch (err) {
    alert(err.data?.message || t('common.error'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadSections(), loadTable()])
})
</script>
