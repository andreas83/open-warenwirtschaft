<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('restaurant.reservations.newReservation') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('restaurant.reservations.createSubtitle') }}</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <form @submit.prevent="saveReservation">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('restaurant.reservations.table') }} *
              </label>
              <select
                v-model="form.TischID"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{{ $t('common.select') }}</option>
                <option v-for="table in availableTables" :key="table.TischID" :value="table.TischID">
                  {{ table.Tischnummer }}
                  <span v-if="table.Tischbereiche"> - {{ table.Tischbereiche.Name }}</span>
                  ({{ table.Kapazitaet }} {{ $t('restaurant.tables.seats') }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('restaurant.reservations.guestName') }} *
              </label>
              <input
                v-model="form.Gastname"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="$t('restaurant.reservations.guestNamePlaceholder')"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('common.phone') }}
                </label>
                <input
                  v-model="form.Telefon"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('common.phonePlaceholder')"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('common.email') }}
                </label>
                <input
                  v-model="form.Email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('common.emailPlaceholder')"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('restaurant.reservations.dateTime') }} *
                </label>
                <input
                  v-model="form.Reservierungsdatum"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ $t('restaurant.reservations.duration') }} *
                </label>
                <input
                  v-model.number="form.Dauer"
                  type="number"
                  required
                  min="15"
                  step="15"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="$t('restaurant.reservations.minutes')"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('restaurant.reservations.guests') }} *
              </label>
              <input
                v-model.number="form.PersonenAnzahl"
                type="number"
                required
                min="1"
                max="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('common.status') }}
              </label>
              <select
                v-model="form.Status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bestaetigt">{{ $t('restaurant.reservations.status.confirmed') }}</option>
                <option value="Eingecheckt">{{ $t('restaurant.reservations.status.checkedIn') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('common.notes') }}
              </label>
              <textarea
                v-model="form.Notizen"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                :placeholder="$t('restaurant.reservations.notesPlaceholder')"
              ></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              @click="navigateTo('/restaurant/reservierungen')"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $t } = useNuxtApp()
const saving = ref(false)
const availableTables = ref([])

const form = ref({
  TischID: '',
  Gastname: '',
  Telefon: '',
  Email: '',
  Reservierungsdatum: '',
  Dauer: 120,
  PersonenAnzahl: 2,
  Status: 'Bestaetigt',
  Notizen: ''
})

const loadTables = async () => {
  try {
    const data = await $fetch('/api/restaurant/tische')
    availableTables.value = data.tables
  } catch (error) {
    console.error('Error loading tables:', error)
  }
}

const saveReservation = async () => {
  saving.value = true
  try {
    await $fetch('/api/restaurant/reservierungen', {
      method: 'POST',
      body: form.value
    })
    navigateTo('/restaurant/reservierungen')
  } catch (error) {
    alert(error.data?.message || $t('common.error'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadTables()

  // Set default datetime to 1 hour from now
  const now = new Date()
  now.setHours(now.getHours() + 1)
  now.setMinutes(0)
  form.value.Reservierungsdatum = now.toISOString().slice(0, 16)
})
</script>
