<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('hotel.bookings.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('hotel.bookings.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/hotel/buchungen/create"
        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-plus text-xl"></span>
        {{ $t('hotel.bookings.newBooking') }}
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
            :placeholder="$t('hotel.bookings.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            @input="debounceSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('common.status') }}</label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="loadBookings"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="Angefragt">{{ $t('hotel.bookings.status.requested') }}</option>
            <option value="Bestaetigt">{{ $t('hotel.bookings.status.confirmed') }}</option>
            <option value="Eingecheckt">{{ $t('hotel.bookings.status.checkedIn') }}</option>
            <option value="Ausgecheckt">{{ $t('hotel.bookings.status.checkedOut') }}</option>
            <option value="Abgeschlossen">{{ $t('hotel.bookings.status.completed') }}</option>
            <option value="Storniert">{{ $t('hotel.bookings.status.cancelled') }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('hotel.bookings.checkInFrom') }}</label>
          <input
            v-model="filterCheckInFrom"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="loadBookings"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('hotel.bookings.checkInTo') }}</label>
          <input
            v-model="filterCheckInTo"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            @change="loadBookings"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>

    <!-- Bookings List -->
    <div v-else class="space-y-4">
      <div
        v-for="booking in bookings"
        :key="booking.BuchungsID"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200 cursor-pointer"
        @click="navigateTo(`/hotel/buchungen/edit/${booking.BuchungsID}`)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-800">{{ booking.Buchungsnummer }}</h3>
              <span :class="getStatusClass(booking.Status)" class="px-3 py-1 text-xs font-semibold rounded-full">
                {{ getStatusText(booking.Status) }}
              </span>
              <span :class="getPaymentStatusClass(booking.Zahlungsstatus)" class="px-3 py-1 text-xs font-semibold rounded-full">
                {{ getPaymentStatusText(booking.Zahlungsstatus) }}
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <p class="text-sm text-gray-500">{{ $t('hotel.bookings.guest') }}</p>
                <p class="text-sm font-medium text-gray-800">{{ booking.Gastname }}</p>
                <p v-if="booking.Email" class="text-xs text-gray-600">{{ booking.Email }}</p>
                <p v-if="booking.Telefon" class="text-xs text-gray-600">{{ booking.Telefon }}</p>
              </div>

              <div>
                <p class="text-sm text-gray-500">{{ $t('hotel.bookings.checkInOut') }}</p>
                <div class="flex items-center gap-2 text-sm text-gray-800">
                  <span class="i-mdi-calendar-arrow-right text-green-600"></span>
                  <span>{{ formatDate(booking.CheckInDatum) }}</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-800">
                  <span class="i-mdi-calendar-arrow-left text-red-600"></span>
                  <span>{{ formatDate(booking.CheckOutDatum) }}</span>
                </div>
              </div>

              <div>
                <p class="text-sm text-gray-500">{{ $t('hotel.bookings.details') }}</p>
                <p class="text-sm text-gray-800">{{ booking.AnzahlErwachsene }} {{ $t('hotel.bookings.adults') }}, {{ booking.AnzahlKinder || 0 }} {{ $t('hotel.bookings.children') }}</p>
                <p class="text-sm text-gray-800">{{ booking._count?.HotelBuchungszimmer || 0 }} {{ $t('hotel.bookings.rooms') }}</p>
              </div>
            </div>

            <div v-if="booking.HotelBuchungszimmer && booking.HotelBuchungszimmer.length > 0" class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="bz in booking.HotelBuchungszimmer"
                :key="bz.BuchungszimmerID"
                class="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
              >
                {{ bz.Zimmer?.Zimmernummer }} - {{ bz.Zimmer?.Zimmerkategorien?.Name }}
              </span>
            </div>
          </div>

          <div class="text-right ml-4">
            <p class="text-2xl font-bold text-purple-600">€ {{ parseFloat(booking.GesamtpreisBrutto).toFixed(2) }}</p>
            <p class="text-xs text-gray-500">{{ $t('hotel.bookings.totalPrice') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && bookings.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
      <span class="i-mdi-calendar-check text-6xl text-gray-300 mb-4"></span>
      <p class="text-gray-500 text-lg">{{ $t('hotel.bookings.noBookings') }}</p>
    </div>
  </div>
</template>

<script setup>
const { $t } = useNuxtApp()
const loading = ref(true)
const bookings = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterCheckInFrom = ref('')
const filterCheckInTo = ref('')
let searchTimeout = null

onMounted(() => {
  loadBookings()
})

async function loadBookings() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (filterStatus.value) params.append('status', filterStatus.value)
    if (filterCheckInFrom.value) params.append('checkInFrom', filterCheckInFrom.value)
    if (filterCheckInTo.value) params.append('checkInTo', filterCheckInTo.value)

    const response = await $fetch(`/api/hotel/buchungen?${params}`)
    bookings.value = response.bookings || []
  } catch (error) {
    console.error('Error loading bookings:', error)
    alert($t('hotel.bookings.errorLoading'))
  } finally {
    loading.value = false
  }
}

function debounceSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadBookings()
  }, 500)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function getStatusClass(status) {
  const classes = {
    'Angefragt': 'bg-gray-100 text-gray-800',
    'Bestaetigt': 'bg-blue-100 text-blue-800',
    'Eingecheckt': 'bg-green-100 text-green-800',
    'Ausgecheckt': 'bg-yellow-100 text-yellow-800',
    'Abgeschlossen': 'bg-gray-100 text-gray-800',
    'Storniert': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusText(status) {
  const texts = {
    'Angefragt': $t('hotel.bookings.status.requested'),
    'Bestaetigt': $t('hotel.bookings.status.confirmed'),
    'Eingecheckt': $t('hotel.bookings.status.checkedIn'),
    'Ausgecheckt': $t('hotel.bookings.status.checkedOut'),
    'Abgeschlossen': $t('hotel.bookings.status.completed'),
    'Storniert': $t('hotel.bookings.status.cancelled')
  }
  return texts[status] || status
}

function getPaymentStatusClass(status) {
  const classes = {
    'Ausstehend': 'bg-yellow-100 text-yellow-800',
    'Angezahlt': 'bg-blue-100 text-blue-800',
    'Bezahlt': 'bg-green-100 text-green-800',
    'Teilbezahlt': 'bg-orange-100 text-orange-800',
    'Rueckerstattet': 'bg-gray-100 text-gray-800',
    'Storniert': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getPaymentStatusText(status) {
  const texts = {
    'Ausstehend': $t('hotel.bookings.paymentStatus.pending'),
    'Angezahlt': $t('hotel.bookings.paymentStatus.deposit'),
    'Bezahlt': $t('hotel.bookings.paymentStatus.paid'),
    'Teilbezahlt': $t('hotel.bookings.paymentStatus.partiallyPaid'),
    'Rueckerstattet': $t('hotel.bookings.paymentStatus.refunded'),
    'Storniert': $t('hotel.bookings.paymentStatus.cancelled')
  }
  return texts[status] || status
}
</script>
