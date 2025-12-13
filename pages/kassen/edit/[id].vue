<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ $t('kassen.editCashRegister') }}</h2>

    <div v-if="loading" class="text-center text-gray-500 py-10">{{ $t('kassen.loadingCashRegister') }}</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <form v-else @submit.prevent="updateKasse" class="bg-white rounded-lg shadow-md p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="bezeichnung" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.designation') }} *</label>
          <input v-model="kasse.Kassenbezeichnung" type="text" id="bezeichnung" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label for="nummer" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.registerNumber') }} *</label>
          <input v-model="kasse.Kassennummer" type="text" id="nummer" required class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label for="standort" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.location') }}</label>
          <select v-model="kasse.StandortID" id="standort" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option :value="null">{{ $t('kassen.noLocation') }}</option>
            <option v-for="standort in standorte" :key="standort.StandortID" :value="standort.StandortID">{{ standort.Name }}</option>
          </select>
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.statusLabel') }}</label>
          <select v-model="kasse.Status" id="status" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Aktiv">{{ $t('kassen.status.active') }}</option>
            <option value="Inaktiv">{{ $t('kassen.status.inactive') }}</option>
            <option value="Geschlossen">{{ $t('kassen.status.closed') }}</option>
          </select>
        </div>

        <div>
          <label for="anfangsbestand" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.initialBalance') }}</label>
          <input v-model="kasse.Anfangsbestand" type="number" step="0.01" id="anfangsbestand" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label for="aktuellerbestand" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.currentBalance') }}</label>
          <input v-model="kasse.AktuellerBestand" type="number" step="0.01" id="aktuellerbestand" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label for="waehrung" class="block text-sm font-medium text-gray-700 mb-2">{{ $t('kassen.currency') }}</label>
          <input v-model="kasse.Waehrung" type="text" id="waehrung" maxlength="3" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('kassen.save') }}</button>
        <NuxtLink to="/kassen" class="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200">{{ $t('kassen.cancel') }}</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const kasse = ref({})
const standorte = ref([])
const loading = ref(true)
const error = ref(null)

async function fetchKasse() {
  try {
    loading.value = true
    const response = await $fetch(`/api/kassen?id=${route.params.id}`)
    if (response.KassenID) {
      kasse.value = response
    } else {
      error.value = 'Kasse nicht gefunden'
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Kasse: ' + err.message
    console.error('Error fetching kasse:', err)
  } finally {
    loading.value = false
  }
}

async function fetchStandorte() {
  try {
    const response = await $fetch('/api/standorte?limit=100')
    if (Array.isArray(response)) {
      standorte.value = response
    }
  } catch (err) {
    console.error('Error fetching standorte:', err)
  }
}

async function updateKasse() {
  try {
    await $fetch(`/api/kassen?id=${route.params.id}`, {
      method: 'PUT',
      body: kasse.value
    })
    router.push('/kassen')
  } catch (err) {
    alert('Fehler beim Aktualisieren der Kasse: ' + err.message)
    console.error('Error updating kasse:', err)
  }
}

onMounted(() => {
  fetchKasse()
  fetchStandorte()
})
</script>
