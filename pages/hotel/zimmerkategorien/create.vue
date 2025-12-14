<template>
  <div class="p-6">
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <NuxtLink to="/hotel/zimmerkategorien" class="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
          <span class="i-mdi-arrow-left text-xl"></span>
          {{ t('common.back') }}
        </NuxtLink>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('hotel.categories.newCategory') }}</h1>
        <p class="text-gray-600 mb-6">{{ t('hotel.categories.createSubtitle') }}</p>

        <form @submit.prevent="saveCategory" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('common.name') }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                :placeholder="t('hotel.categories.namePlaceholder', 'z.B. Doppelzimmer Standard')"
              />
            </div>

            <!-- Grundpreis -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.categories.basePrice', 'Grundpreis pro Nacht') }} <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                <input
                  v-model.number="form.grundpreis"
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
                {{ t('hotel.categories.maxPersons', 'Max. Personen') }}
              </label>
              <input
                v-model.number="form.maxPersonen"
                type="number"
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Größe -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.categories.size', 'Größe (m²)') }}
              </label>
              <input
                v-model.number="form.groesse"
                type="number"
                step="0.1"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <!-- Bild URL -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ t('hotel.categories.imageUrl', 'Bild URL') }}
              </label>
              <input
                v-model="form.bildURL"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
              />
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
              :placeholder="t('hotel.categories.descriptionPlaceholder', 'Beschreiben Sie die Zimmerkategorie...')"
            ></textarea>
          </div>

          <!-- Ausstattung -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('hotel.categories.amenities', 'Ausstattung') }}
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label v-for="amenity in availableAmenities" :key="amenity.value" class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.ausstattung"
                  type="checkbox"
                  :value="amenity.value"
                  class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-700">{{ amenity.label }}</span>
              </label>
            </div>
          </div>

          <!-- Aktiv -->
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.istAktiv"
                type="checkbox"
                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="text-sm text-gray-700">{{ t('common.active') }}</span>
            </label>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-4 pt-4 border-t">
            <NuxtLink
              to="/hotel/zimmerkategorien"
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

const saving = ref(false)

const form = ref({
  name: '',
  beschreibung: '',
  grundpreis: null,
  maxPersonen: 2,
  groesse: null,
  bildURL: '',
  ausstattung: [],
  istAktiv: true
})

const availableAmenities = [
  { value: 'wifi', label: 'WLAN' },
  { value: 'tv', label: 'TV' },
  { value: 'minibar', label: 'Minibar' },
  { value: 'safe', label: 'Safe' },
  { value: 'aircon', label: 'Klimaanlage' },
  { value: 'balcony', label: 'Balkon' },
  { value: 'bathtub', label: 'Badewanne' },
  { value: 'shower', label: 'Dusche' }
]

async function saveCategory() {
  if (!form.value.name || !form.value.grundpreis) {
    alert(t('common.required'))
    return
  }

  saving.value = true
  try {
    await $fetch('/api/hotel/zimmerkategorien', {
      method: 'POST',
      body: form.value
    })
    router.push('/hotel/zimmerkategorien')
  } catch (error) {
    console.error('Error creating category:', error)
    alert(error.data?.message || t('hotel.categories.errorSaving', 'Fehler beim Speichern'))
  } finally {
    saving.value = false
  }
}
</script>
