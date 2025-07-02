<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Umsatzsteuersatz bearbeiten</h1>
    <div v-if="loading" class="text-center">Lade...</div>
    <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
    <div v-else>
      <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label for="name" class="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input id="name" v-model="umsatzsteuersatz.name" type="text" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="mb-4">
          <label for="steuersatz" class="block text-gray-700 text-sm font-bold mb-2">Steuersatz (%)</label>
          <input id="steuersatz" v-model="umsatzsteuersatz.steuersatz" type="number" step="0.01" required
                 class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        </div>
        <div class="flex items-center justify-between">
          <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Speichern
          </button>
          <nuxt-link to="/umsatzsteuersaetze" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            Zurück zur Liste
          </nuxt-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const umsatzsteuersatz = ref({ name: '', steuersatz: 0 })
const loading = ref(true)
const error = ref(null)

const fetchUmsatzsteuersatz = async () => {
  try {
    const response = await fetch(`/api/umsatzsteuersaetze?id=${id}`)
    if (!response.ok) throw new Error('Fehler beim Laden des Umsatzsteuersatzes: HTTP Status ' + response.status)
    const data = await response.json()
    console.log('API Response:', data); // Debug log to inspect the response structure
    umsatzsteuersatz.value = {
      name: data.Name || data.name || '',
      steuersatz: parseFloat(data.Steuersatz || data.steuersatz || 0)
    }
  } catch (err) {
    error.value = 'Fehler beim Laden des Umsatzsteuersatzes: ' + err.message
    console.error('Fetch Error:', err);
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    const response = await fetch(`/api/umsatzsteuersaetze/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(umsatzsteuersatz.value)
    })
    if (!response.ok) throw new Error('Fehler beim Speichern des Umsatzsteuersatzes')
    router.push('/umsatzsteuersaetze')
  } catch (err) {
    alert(err.message)
  }
}

onMounted(fetchUmsatzsteuersatz)
</script>
