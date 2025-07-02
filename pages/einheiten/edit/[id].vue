<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Einheit Bearbeiten</h2>
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">Lade Einheit...</div>
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 max-w-5xl mx-auto">
        <form @submit.prevent="saveEinheit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Name</label>
              <input id="name" v-model="einheit.Name" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
            </div>
            <div>
              <label for="symbol" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Symbol</label>
              <input id="symbol" v-model="einheit.Symbol" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-6">
            <NuxtLink to="/einheiten" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</NuxtLink>
            <button type="submit" class="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 text-sm font-medium">Speichern</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const einheit = ref({})
const loading = ref(true)
const error = ref(null)

async function fetchEinheit() {
  try {
    loading.value = true
    const response = await $fetch(`/api/einheiten?id=${id}`)
    if (response.status === 404) {
      error.value = 'Einheit nicht gefunden'
    } else {
      einheit.value = response
    }
  } catch (err) {
    error.value = 'Fehler beim Laden der Einheit: ' + err.message
  } finally {
    loading.value = false
  }
}

async function saveEinheit() {
  try {
    await $fetch(`/api/einheiten?id=${id}`, {
      method: 'PUT',
      body: einheit.value
    })
    router.push('/einheiten')
  } catch (err) {
    alert('Fehler beim Speichern der Einheit: ' + err.message)
  }
}

onMounted(async () => {
  await fetchEinheit()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
