<template>
  <div class="container mx-auto py-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-gray-800">{{ $t('kassen.bookingsTitle') }}</h2>
      <NuxtLink to="/kassen" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200">{{ $t('kassen.backToList') }}</NuxtLink>
    </div>

    <div v-if="loadingKasse" class="text-center text-gray-500 py-10">{{ $t('kassen.loadingCashRegister') }}</div>
    <div v-else-if="errorKasse" class="text-center text-red-500 py-10">{{ errorKasse }}</div>
    <div v-else class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-xl font-semibold mb-4">{{ kasse.Kassenbezeichnung }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p class="text-gray-600 text-sm">{{ $t('kassen.registerNumber') }}</p>
          <p class="font-semibold">{{ kasse.Kassennummer }}</p>
        </div>
        <div v-if="kasse.Standorte">
          <p class="text-gray-600 text-sm">{{ $t('kassen.location') }}</p>
          <p class="font-semibold">{{ kasse.Standorte.Name }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">{{ $t('kassen.initialBalance') }}</p>
          <p class="font-semibold">{{ Number(kasse.Anfangsbestand).toFixed(2) }} {{ kasse.Waehrung }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">{{ $t('kassen.currentBalance') }}</p>
          <p class="font-bold text-blue-600 text-xl">{{ Number(kasse.AktuellerBestand).toFixed(2) }} {{ kasse.Waehrung }}</p>
        </div>
      </div>
    </div>

    <!-- New Booking Form -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-xl font-semibold mb-4">{{ $t('kassen.newBooking') }}</h3>
      <form @submit.prevent="createBuchung" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="buchungstyp" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.bookingType') }} *</label>
          <select v-model="buchung.Buchungstyp" id="buchungstyp" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Einnahme">{{ $t('kassen.types.income') }}</option>
            <option value="Ausgabe">{{ $t('kassen.types.expense') }}</option>
            <option value="Entnahme">{{ $t('kassen.types.withdrawal') }}</option>
            <option value="Einlage">{{ $t('kassen.types.deposit') }}</option>
            <option value="Kassenabschluss">{{ $t('kassen.types.cashClosing') }}</option>
          </select>
        </div>

        <div>
          <label for="betrag" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.amount') }} *</label>
          <input v-model="buchung.Betrag" type="number" step="0.01" id="betrag" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label for="zahlungsart" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.paymentMethod') }} *</label>
          <select v-model="buchung.Zahlungsart" id="zahlungsart" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Bar">{{ $t('kassen.payment.cash') }}</option>
            <option value="Kreditkarte">{{ $t('kassen.payment.creditCard') }}</option>
            <option value="EC-Karte">{{ $t('kassen.payment.ecCard') }}</option>
            <option value="Gutschein">{{ $t('kassen.payment.voucher') }}</option>
            <option value="Sonstige">{{ $t('kassen.payment.other') }}</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label for="beschreibung" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.description') }}</label>
          <input v-model="buchung.Beschreibung" type="text" id="beschreibung" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label for="belegnummer" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.receiptNumber') }}</label>
          <input v-model="buchung.Belegnummer" type="text" id="belegnummer" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="md:col-span-3">
          <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('kassen.addBooking') }}</button>
        </div>
      </form>
    </div>

    <!-- Bookings List -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-xl font-semibold mb-4">{{ $t('kassen.bookingHistory') }}</h3>
      <div v-if="loadingBuchungen" class="text-center text-gray-500 py-10">{{ $t('kassen.loadingBookings') }}</div>
      <div v-else-if="errorBuchungen" class="text-center text-red-500 py-10">{{ errorBuchungen }}</div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('kassen.date') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('kassen.bookingType') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('kassen.paymentMethod') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('kassen.amount') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('kassen.description') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('kassen.receiptNumber') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="b in buchungen" :key="b.BuchungsID" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm">{{ formatDate(b.Buchungsdatum) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span :class="getTypeClass(b.Buchungstyp)" class="px-2 py-1 rounded-full text-xs">{{ b.Buchungstyp }}</span>
                </td>
                <td class="px-4 py-3 text-sm">{{ b.Zahlungsart }}</td>
                <td class="px-4 py-3 text-sm font-semibold" :class="getAmountClass(b.Buchungstyp)">
                  {{ getAmountSign(b.Buchungstyp) }}{{ Number(b.Betrag).toFixed(2) }} {{ kasse.Waehrung }}
                </td>
                <td class="px-4 py-3 text-sm">{{ b.Beschreibung || '-' }}</td>
                <td class="px-4 py-3 text-sm">{{ b.Belegnummer || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="buchungen.length === 0" class="text-center text-gray-500 py-10">
          {{ $t('kassen.noBookingsFound') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const kasse = ref({})
const buchungen = ref([])
const loadingKasse = ref(true)
const loadingBuchungen = ref(true)
const errorKasse = ref(null)
const errorBuchungen = ref(null)

const buchung = ref({
  KassenID: route.params.id,
  Buchungstyp: 'Einnahme',
  Betrag: 0,
  Zahlungsart: 'Bar',
  Beschreibung: '',
  Belegnummer: ''
})

async function fetchKasse() {
  try {
    loadingKasse.value = true
    const response = await $fetch(`/api/kassen?id=${route.params.id}`)
    if (response.KassenID) {
      kasse.value = response
    } else {
      errorKasse.value = 'Kasse nicht gefunden'
    }
  } catch (err) {
    errorKasse.value = 'Fehler beim Laden der Kasse: ' + err.message
    console.error('Error fetching kasse:', err)
  } finally {
    loadingKasse.value = false
  }
}

async function fetchBuchungen() {
  try {
    loadingBuchungen.value = true
    const response = await $fetch(`/api/kassenbuchungen?kasse=${route.params.id}&limit=100`)
    if (Array.isArray(response)) {
      buchungen.value = response
    } else {
      buchungen.value = []
    }
  } catch (err) {
    errorBuchungen.value = 'Fehler beim Laden der Buchungen: ' + err.message
    buchungen.value = []
    console.error('Error fetching buchungen:', err)
  } finally {
    loadingBuchungen.value = false
  }
}

async function createBuchung() {
  try {
    await $fetch('/api/kassenbuchungen', {
      method: 'POST',
      body: buchung.value
    })

    // Reset form
    buchung.value = {
      KassenID: route.params.id,
      Buchungstyp: 'Einnahme',
      Betrag: 0,
      Zahlungsart: 'Bar',
      Beschreibung: '',
      Belegnummer: ''
    }

    // Refresh data
    await fetchKasse()
    await fetchBuchungen()
  } catch (err) {
    alert('Fehler beim Erstellen der Buchung: ' + err.message)
    console.error('Error creating buchung:', err)
  }
}

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('de-DE')
}

function getTypeClass(typ) {
  switch (typ) {
    case 'Einnahme':
      return 'bg-green-100 text-green-800'
    case 'Ausgabe':
      return 'bg-red-100 text-red-800'
    case 'Einlage':
      return 'bg-blue-100 text-blue-800'
    case 'Entnahme':
      return 'bg-orange-100 text-orange-800'
    case 'Kassenabschluss':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getAmountClass(typ) {
  if (typ === 'Einnahme' || typ === 'Einlage') {
    return 'text-green-600'
  } else if (typ === 'Ausgabe' || typ === 'Entnahme') {
    return 'text-red-600'
  }
  return 'text-gray-600'
}

function getAmountSign(typ) {
  if (typ === 'Einnahme' || typ === 'Einlage') {
    return '+'
  } else if (typ === 'Ausgabe' || typ === 'Entnahme') {
    return '-'
  }
  return ''
}

onMounted(() => {
  fetchKasse()
  fetchBuchungen()
})
</script>
