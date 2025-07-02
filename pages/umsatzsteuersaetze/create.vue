<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Neuen Umsatzsteuersatz erstellen</h1>
    <div v-if="loading" class="text-center">
      <div class="i-svg-spinners:blocks-wave inline-block" />
      Lade...
    </div>
    <div v-if="loading" class="text-center">
      <div class="i-svg-spinners:blocks-wave inline-block" />
      Lade...
    </div>
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
            Erstellen
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const umsatzsteuersatz = ref({ name: '', steuersatz: 0 })
const loading = ref(false)
const error = ref(null)

const handleSubmit = async () => {
  try {
    const payload = {
      Name: umsatzsteuersatz.value.name,
      Steuersatz: umsatzsteuersatz.value.steuersatz.toString()
    };
    const response = await fetch('/api/umsatzsteuersaetze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error('Fehler beim Erstellen des Umsatzsteuersatzes: HTTP Status ' + response.status)
    router.push('/umsatzsteuersaetze')
  } catch (err) {
    error.value = err.message
    alert(err.message)
  }
}
</script>
