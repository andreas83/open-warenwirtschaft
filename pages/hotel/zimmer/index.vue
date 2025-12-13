<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('hotel.rooms.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('hotel.rooms.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/hotel/zimmer/create"
        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-plus text-xl"></span>
        {{ $t('hotel.rooms.newRoom') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('common.search') }}</label>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('hotel.rooms.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            @input="debounceSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('hotel.rooms.category') }}</label>
          <select
            v-model="filterCategory"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="loadRooms"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="cat in categories" :key="cat.ZimmerkategorieID" :value="cat.ZimmerkategorieID">
              {{ cat.Name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('common.status') }}</label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="loadRooms"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="Verfuegbar">{{ $t('hotel.rooms.status.available') }}</option>
            <option value="Belegt">{{ $t('hotel.rooms.status.occupied') }}</option>
            <option value="Reserviert">{{ $t('hotel.rooms.status.reserved') }}</option>
            <option value="Reinigung">{{ $t('hotel.rooms.status.cleaning') }}</option>
            <option value="Wartung">{{ $t('hotel.rooms.status.maintenance') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>

    <!-- Rooms Table -->
    <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('hotel.rooms.roomNumber') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('hotel.rooms.category') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('hotel.rooms.floor') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.status') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('hotel.rooms.price') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="room in rooms" :key="room.ZimmerID" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">{{ room.Zimmernummer }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ room.Zimmerkategorien?.Name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ room.Etage || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(room.Status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(room.Status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">€ {{ parseFloat(room.PreisProNacht).toFixed(2) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <NuxtLink :to="`/hotel/zimmer/edit/${room.ZimmerID}`" class="text-purple-600 hover:text-purple-900 mr-3">
                {{ $t('common.edit') }}
              </NuxtLink>
              <button @click="deleteRoom(room.ZimmerID)" class="text-red-600 hover:text-red-900">
                {{ $t('common.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && rooms.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
      <span class="i-mdi-bed text-6xl text-gray-300 mb-4"></span>
      <p class="text-gray-500 text-lg">{{ $t('hotel.rooms.noRooms') }}</p>
    </div>
  </div>
</template>

<script setup>
const { $t } = useNuxtApp()
const loading = ref(true)
const rooms = ref([])
const categories = ref([])
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
let searchTimeout = null

onMounted(() => {
  loadCategories()
  loadRooms()
})

async function loadCategories() {
  try {
    const response = await $fetch('/api/hotel/zimmerkategorien')
    categories.value = response.categories || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

async function loadRooms() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (filterCategory.value) params.append('kategorieId', filterCategory.value)
    if (filterStatus.value) params.append('status', filterStatus.value)

    const response = await $fetch(`/api/hotel/zimmer?${params}`)
    rooms.value = response.rooms || []
  } catch (error) {
    console.error('Error loading rooms:', error)
    alert($t('hotel.rooms.errorLoading'))
  } finally {
    loading.value = false
  }
}

function debounceSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadRooms()
  }, 500)
}

async function deleteRoom(id) {
  if (!confirm($t('hotel.rooms.confirmDelete'))) return

  try {
    await $fetch(`/api/hotel/zimmer?id=${id}`, { method: 'DELETE' })
    await loadRooms()
  } catch (error) {
    console.error('Error deleting room:', error)
    alert(error.data?.message || $t('hotel.rooms.errorDeleting'))
  }
}

function getStatusClass(status) {
  const classes = {
    'Verfuegbar': 'bg-green-100 text-green-800',
    'Belegt': 'bg-red-100 text-red-800',
    'Reserviert': 'bg-yellow-100 text-yellow-800',
    'Reinigung': 'bg-blue-100 text-blue-800',
    'Wartung': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusText(status) {
  const texts = {
    'Verfuegbar': $t('hotel.rooms.status.available'),
    'Belegt': $t('hotel.rooms.status.occupied'),
    'Reserviert': $t('hotel.rooms.status.reserved'),
    'Reinigung': $t('hotel.rooms.status.cleaning'),
    'Wartung': $t('hotel.rooms.status.maintenance')
  }
  return texts[status] || status
}
</script>
