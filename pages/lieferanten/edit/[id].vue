<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Lieferant Bearbeiten</h2>
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">Lade Lieferant...</div>
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 max-w-5xl mx-auto">
        <form @submit.prevent="saveLieferant" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="name" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Name</label>
              <input id="name" v-model="lieferant.Name" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
            </div>
            <div>
              <label for="lieferantennummer" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Lieferantennummer</label>
              <input id="lieferantennummer" v-model="lieferant.Lieferantennummer" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="telefon" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Telefon</label>
              <input id="telefon" v-model="lieferant.Telefon" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="email" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email</label>
              <input id="email" v-model="lieferant.Email" type="email" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
          </div>
          <div>
            <label for="adresse" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Adresse</label>
            <textarea id="adresse" v-model="lieferant.Adresse" rows="3" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="plz" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">PLZ</label>
              <input id="plz" v-model="lieferant.PLZ" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="ort" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Ort</label>
              <input id="ort" v-model="lieferant.Ort" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="land" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Land</label>
              <input id="land" v-model="lieferant.Land" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-6">
            <NuxtLink to="/lieferanten" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</NuxtLink>
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

const lieferant = ref({})
const loading = ref(true)
const error = ref(null)

async function fetchLieferant() {
  try {
    loading.value = true
    const response = await $fetch(`/api/lieferanten?id=${id}`)
    if (response.status === 404) {
      error.value = 'Lieferant nicht gefunden'
    } else {
      lieferant.value = response
    }
  } catch (err) {
    error.value = 'Fehler beim Laden des Lieferanten: ' + err.message
  } finally {
    loading.value = false
  }
}

async function saveLieferant() {
  try {
    await $fetch(`/api/lieferanten?id=${id}`, {
      method: 'PUT',
      body: lieferant.value
    })
    router.push('/lieferanten')
  } catch (err) {
    alert('Fehler beim Speichern des Lieferanten: ' + err.message)
  }
}

onMounted(async () => {
  await fetchLieferant()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
