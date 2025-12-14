<template>
  <div class="p-6">
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <NuxtLink to="/hotel/zimmer" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          <span class="i-mdi-arrow-left text-xl"></span>
          {{ t('common.back') }}
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('hotel.rooms.editRoom', 'Zimmer bearbeiten') }}</h1>
        <p class="text-gray-600 mb-6">{{ t('hotel.rooms.editSubtitle', 'Bearbeiten Sie die Zimmerdaten') }}</p>

        <form @submit.prevent="saveRoom" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Zimmernummer -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.rooms.roomNumber') }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.zimmernummer"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Kategorie -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.rooms.category') }} <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.zimmerkategorieID"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{{ t('common.select') }}</option>
                <option v-for="cat in categories" :key="cat.ZimmerkategorieID" :value="cat.ZimmerkategorieID">
                  {{ cat.Name }}
                </option>
              </select>
            </div>

            <!-- Etage -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.rooms.floor') }}
              </label>
              <input
                v-model.number="form.etage"
                type="number"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Preis pro Nacht -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.rooms.price') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                <input
                  v-model.number="form.preisProNacht"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <!-- Max Personen -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.rooms.maxPersons') }}
              </label>
              <input
                v-model.number="form.maxPersonen"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('common.status') }}
              </label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Verfuegbar">{{ t('hotel.rooms.status.available') }}</option>
                <option value="Belegt">{{ t('hotel.rooms.status.occupied') }}</option>
                <option value="Reserviert">{{ t('hotel.rooms.status.reserved') }}</option>
                <option value="Reinigung">{{ t('hotel.rooms.status.cleaning') }}</option>
                <option value="Wartung">{{ t('hotel.rooms.status.maintenance') }}</option>
              </select>
            </div>
          </div>

          <!-- Beschreibung -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('common.description') }}
            </label>
            <textarea
              v-model="form.beschreibung"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <!-- Optionen -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.istRaucherZimmer"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-700">{{ t('hotel.rooms.smokingRoom') }}</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.istBarrierfrei"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-700">{{ t('hotel.rooms.accessible') }}</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.istAktiv"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-700">{{ t('common.active') }}</span>
            </label>
          </div>

          <!-- Notizen -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('common.notes') }}
            </label>
            <textarea
              v-model="form.notizen"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-4 pt-4 border-t">
            <NuxtLink
              to="/hotel/zimmer"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              {{ t('common.cancel') }}
            </NuxtLink>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="saving" class="i-svg-spinners-ring-resize w-5 h-5"></span>
              <span v-else class="i-mdi-content-save w-5 h-5"></span>
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
const router = useRouter()
const route = useRoute()

const loading = ref(true)
const saving = ref(false)
const categories = ref([])
const roomId = computed(() => parseInt(route.params.id))

const form = ref({
  zimmernummer: '',
  zimmerkategorieID: '',
  etage: null,
  preisProNacht: null,
  maxPersonen: 2,
  status: 'Verfuegbar',
  beschreibung: '',
  istRaucherZimmer: false,
  istBarrierfrei: false,
  istAktiv: true,
  notizen: ''
})

onMounted(async () => {
  await loadCategories()
  await loadRoom()
})

async function loadCategories() {
  try {
    const response = await $fetch('/api/hotel/zimmerkategorien')
    categories.value = response.categories || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

async function loadRoom() {
  loading.value = true
  try {
    const room = await $fetch(`/api/hotel/zimmer?id=${roomId.value}`)
    form.value = {
      zimmernummer: room.Zimmernummer || '',
      zimmerkategorieID: room.ZimmerkategorieID || '',
      etage: room.Etage != null ? parseInt(room.Etage) : null,
      preisProNacht: room.PreisProNacht ? parseFloat(room.PreisProNacht) : null,
      maxPersonen: room.MaxPersonen || 2,
      status: room.Status || 'Verfuegbar',
      beschreibung: room.Beschreibung || '',
      istRaucherZimmer: room.IstRaucherZimmer || false,
      istBarrierfrei: room.IstBarrierfrei || false,
      istAktiv: room.IstAktiv !== false,
      notizen: room.Notizen || ''
    }
  } catch (error) {
    console.error('Error loading room:', error)
    alert(t('hotel.rooms.errorLoading'))
    router.push('/hotel/zimmer')
  } finally {
    loading.value = false
  }
}

async function saveRoom() {
  if (!form.value.zimmernummer || !form.value.zimmerkategorieID || !form.value.preisProNacht) {
    alert(t('common.required'))
    return
  }

  saving.value = true
  try {
    await $fetch('/api/hotel/zimmer', {
      method: 'PUT',
      body: {
        id: roomId.value,
        ...form.value
      }
    })
    router.push('/hotel/zimmer')
  } catch (error) {
    console.error('Error updating room:', error)
    alert(error.data?.message || t('hotel.rooms.errorSaving', 'Fehler beim Speichern'))
  } finally {
    saving.value = false
  }
}
</script>
