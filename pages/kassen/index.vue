<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ $t('kassen.listTitle') }}</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">{{ $t('kassen.loadingCashRegisters') }}</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="flex gap-2">
          <NuxtLink to="/kassen/create" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('kassen.newCashRegister') }}</NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="searchQuery" type="text" :placeholder="$t('kassen.searchPlaceholder')" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @input="debouncedSearch" ref="searchInput" autofocus>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <select v-model="statusFilter" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-48" @change="fetchKassen">
            <option value="">{{ $t('kassen.allStatuses') }}</option>
            <option value="Aktiv">{{ $t('kassen.status.active') }}</option>
            <option value="Inaktiv">{{ $t('kassen.status.inactive') }}</option>
            <option value="Geschlossen">{{ $t('kassen.status.closed') }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="kasse in kassen" :key="kasse.KassenID" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <div class="flex flex-col gap-3">
            <div class="flex justify-between items-start">
              <h3 class="text-lg font-semibold text-gray-800">{{ kasse.Kassenbezeichnung }}</h3>
              <span :class="getStatusClass(kasse.Status)" class="text-xs px-2 py-1 rounded-full">{{ kasse.Status }}</span>
            </div>
            <p class="text-gray-600 text-sm">{{ $t('kassen.registerNumber') }}: {{ kasse.Kassennummer }}</p>
            <p class="text-gray-600 text-sm" v-if="kasse.Standorte">{{ $t('kassen.location') }}: {{ kasse.Standorte.Name }}</p>

            <div class="bg-gray-50 rounded p-3 mt-2">
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600 text-sm">{{ $t('kassen.initialBalance') }}:</span>
                <span class="text-gray-800 font-medium">{{ Number(kasse.Anfangsbestand).toFixed(2) }} {{ kasse.Waehrung }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600 text-sm">{{ $t('kassen.currentBalance') }}:</span>
                <span class="text-blue-600 font-bold text-lg">{{ Number(kasse.AktuellerBestand).toFixed(2) }} {{ kasse.Waehrung }}</span>
              </div>
            </div>

            <div class="flex gap-2 mt-3">
              <NuxtLink :to="`/kassen/buchungen/${kasse.KassenID}`" class="flex-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg hover:bg-green-200 transition duration-200 text-sm text-center">{{ $t('kassen.bookings') }}</NuxtLink>
              <NuxtLink :to="`/kassen/edit/${kasse.KassenID}`" class="flex-1 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-200 transition duration-200 text-sm text-center">{{ $t('kassen.edit') }}</NuxtLink>
              <button @click="deleteKasse(kasse.KassenID)" class="flex-1 bg-red-100 text-red-800 px-3 py-2 rounded-lg hover:bg-red-200 transition duration-200 text-sm">{{ $t('kassen.delete') }}</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="kassen.length === 0" class="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md mt-4">
        {{ $t('kassen.noCashRegistersFound') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const kassen = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const searchInput = ref(null)
const statusFilter = ref('')
let searchTimeout = null

async function fetchKassen() {
  try {
    loading.value = true
    let url = '/api/kassen?limit=100'
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    if (statusFilter.value) {
      url += `&status=${encodeURIComponent(statusFilter.value)}`
    }
    const response = await $fetch(url)
    if (Array.isArray(response)) {
      kassen.value = response
    } else {
      kassen.value = []
      error.value = 'Fehler beim Laden der Kassen'
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Kassen: ' + err.message
    kassen.value = []
    console.error('Fetch Kassen Error:', err)
  } finally {
    loading.value = false
  }
}

async function deleteKasse(id) {
  if (confirm($t('kassen.confirmDeleteCashRegister'))) {
    try {
      await $fetch(`/api/kassen?id=${id}`, { method: 'DELETE' })
      kassen.value = kassen.value.filter(k => k.KassenID !== id)
    } catch (err) {
      alert('Fehler beim Löschen der Kasse: ' + err.message)
    }
  }
}

function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(async () => {
    await fetchKassen()
    if (searchInput.value) {
      searchInput.value.focus()
    }
  }, 500)
}

function getStatusClass(status) {
  switch (status) {
    case 'Aktiv':
      return 'bg-green-100 text-green-800'
    case 'Inaktiv':
      return 'bg-yellow-100 text-yellow-800'
    case 'Geschlossen':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(async () => {
  await fetchKassen()
  if (searchInput.value) {
    searchInput.value.focus()
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
