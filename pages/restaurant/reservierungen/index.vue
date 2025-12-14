<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ t('restaurant.reservations.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ t('restaurant.reservations.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/restaurant/reservierungen/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-calendar-plus text-xl"></span>
        {{ t('restaurant.reservations.newReservation') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('common.search') }}
          </label>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('restaurant.reservations.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debounceSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('common.date') }}
          </label>
          <input
            v-model="filterDatum"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadReservations"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('common.status') }}
          </label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadReservations"
          >
            <option value="">{{ t('common.all') }}</option>
            <option value="Bestaetigt">{{ t('restaurant.reservations.status.confirmed') }}</option>
            <option value="Eingecheckt">{{ t('restaurant.reservations.status.checkedIn') }}</option>
            <option value="Abgeschlossen">{{ t('restaurant.reservations.status.completed') }}</option>
            <option value="Storniert">{{ t('restaurant.reservations.status.cancelled') }}</option>
            <option value="Nicht_Erschienen">{{ t('restaurant.reservations.status.noShow') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Reservations List -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('restaurant.reservations.guestName') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('restaurant.reservations.table') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('restaurant.reservations.dateTime') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('restaurant.reservations.guests') }}
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
          <tr
            v-for="reservation in reservations"
            :key="reservation.ReservierungsID"
            class="hover:bg-gray-50 cursor-pointer"
            @click="navigateTo(`/restaurant/reservierungen/edit/${reservation.ReservierungsID}`)"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ reservation.Gastname }}</div>
              <div class="text-sm text-gray-500">{{ reservation.Telefon }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ reservation.RestaurantTische?.Tischnummer }}</div>
              <div v-if="reservation.RestaurantTische?.Tischbereiche" class="text-sm text-gray-500">
                {{ reservation.RestaurantTische.Tischbereiche.Name }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDateTime(reservation.Reservierungsdatum) }}</div>
              <div class="text-sm text-gray-500">{{ reservation.Dauer }} {{ t('restaurant.reservations.minutes') }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ reservation.PersonenAnzahl }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getStatusClass(reservation.Status)"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ getStatusText(reservation.Status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click.stop="deleteReservation(reservation.ReservierungsID)"
                class="text-red-600 hover:text-red-900 ml-3"
              >
                {{ t('common.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="reservations.length === 0" class="text-center py-12">
        <span class="i-mdi-calendar-blank text-6xl text-gray-400 mb-4"></span>
        <p class="text-gray-500 text-lg">{{ t('restaurant.reservations.noReservations') }}</p>
      </div>
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
const reservations = ref([])
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const searchQuery = ref('')
const filterDatum = ref('')
const filterStatus = ref('')
let debounceTimer = null

const loadReservations = async () => {
  loading.value = true
  try {
    const params = {
      limit: limit.value,
      offset: offset.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (filterDatum.value) params.datum = filterDatum.value
    if (filterStatus.value) params.status = filterStatus.value

    const data = await $fetch('/api/restaurant/reservierungen', { params })
    reservations.value = data.reservations
    total.value = data.total
  } catch (error) {
    console.error('Error loading reservations:', error)
  } finally {
    loading.value = false
  }
}

const debounceSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    offset.value = 0
    loadReservations()
  }, 300)
}

const goToPage = (newOffset) => {
  offset.value = newOffset
  loadReservations()
}

const deleteReservation = async (id) => {
  if (!confirm(t('restaurant.reservations.confirmDelete'))) return

  try {
    await $fetch(`/api/restaurant/reservierungen?id=${id}`, { method: 'DELETE' })
    await loadReservations()
  } catch (error) {
    alert(error.data?.message || t('common.error'))
  }
}

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status) => {
  const classes = {
    Bestaetigt: 'bg-blue-100 text-blue-800',
    Eingecheckt: 'bg-green-100 text-green-800',
    Abgeschlossen: 'bg-gray-100 text-gray-800',
    Storniert: 'bg-red-100 text-red-800',
    Nicht_Erschienen: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    Bestaetigt: t('restaurant.reservations.status.confirmed'),
    Eingecheckt: t('restaurant.reservations.status.checkedIn'),
    Abgeschlossen: t('restaurant.reservations.status.completed'),
    Storniert: t('restaurant.reservations.status.cancelled'),
    Nicht_Erschienen: t('restaurant.reservations.status.noShow')
  }
  return texts[status] || status
}

onMounted(() => {
  // Set today's date as default filter
  const today = new Date().toISOString().split('T')[0]
  filterDatum.value = today
  loadReservations()
})
</script>
