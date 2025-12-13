<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">{{ $t('hotel.dashboard.title') }}</h1>
      <p class="text-gray-600 mt-1">{{ $t('hotel.dashboard.subtitle') }}</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ $t('hotel.dashboard.availableRooms') }}</p>
            <p class="text-3xl font-bold text-green-600">{{ stats.availableRooms }}</p>
          </div>
          <span class="i-mdi-bed text-4xl text-green-600 opacity-50"></span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ $t('hotel.dashboard.occupiedRooms') }}</p>
            <p class="text-3xl font-bold text-red-600">{{ stats.occupiedRooms }}</p>
          </div>
          <span class="i-mdi-bed-king text-4xl text-red-600 opacity-50"></span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ $t('hotel.dashboard.todayCheckIns') }}</p>
            <p class="text-3xl font-bold text-blue-600">{{ stats.todayCheckIns }}</p>
          </div>
          <span class="i-mdi-calendar-arrow-right text-4xl text-blue-600 opacity-50"></span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">{{ $t('hotel.dashboard.todayCheckOuts') }}</p>
            <p class="text-3xl font-bold text-orange-600">{{ stats.todayCheckOuts }}</p>
          </div>
          <span class="i-mdi-calendar-arrow-left text-4xl text-orange-600 opacity-50"></span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink
        to="/hotel/buchungen"
        class="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md p-6 transition duration-200 flex items-center justify-between"
      >
        <div>
          <h3 class="text-xl font-semibold mb-2">{{ $t('hotel.dashboard.bookings') }}</h3>
          <p class="text-purple-100">{{ $t('hotel.dashboard.manageBookings') }}</p>
        </div>
        <span class="i-mdi-calendar-check text-5xl opacity-50"></span>
      </NuxtLink>

      <NuxtLink
        to="/hotel/zimmer"
        class="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md p-6 transition duration-200 flex items-center justify-between"
      >
        <div>
          <h3 class="text-xl font-semibold mb-2">{{ $t('hotel.dashboard.rooms') }}</h3>
          <p class="text-blue-100">{{ $t('hotel.dashboard.manageRooms') }}</p>
        </div>
        <span class="i-mdi-bed text-5xl opacity-50"></span>
      </NuxtLink>

      <NuxtLink
        to="/hotel/zimmerkategorien"
        class="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md p-6 transition duration-200 flex items-center justify-between"
      >
        <div>
          <h3 class="text-xl font-semibold mb-2">{{ $t('hotel.dashboard.categories') }}</h3>
          <p class="text-green-100">{{ $t('hotel.dashboard.manageCategories') }}</p>
        </div>
        <span class="i-mdi-format-list-bulleted-square text-5xl opacity-50"></span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { $t } = useNuxtApp()
const stats = ref({
  availableRooms: 0,
  occupiedRooms: 0,
  todayCheckIns: 0,
  todayCheckOuts: 0
})

onMounted(() => {
  loadStats()
})

async function loadStats() {
  try {
    // Load room stats
    const roomsResponse = await $fetch('/api/hotel/zimmer')
    const rooms = roomsResponse.rooms || []
    stats.value.availableRooms = rooms.filter(r => r.Status === 'Verfuegbar').length
    stats.value.occupiedRooms = rooms.filter(r => r.Status === 'Belegt').length

    // Load booking stats for today
    const today = new Date().toISOString().split('T')[0]
    const bookingsResponse = await $fetch(`/api/hotel/buchungen?checkInFrom=${today}&checkInTo=${today}`)
    stats.value.todayCheckIns = (bookingsResponse.bookings || []).length

    const checkOutResponse = await $fetch(`/api/hotel/buchungen?checkOutFrom=${today}&checkOutTo=${today}`)
    stats.value.todayCheckOuts = (checkOutResponse.bookings || []).length
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}
</script>
