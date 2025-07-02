<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">Neuer Standort</h2>
    <div class="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <form @submit.prevent="saveStandort" class="space-y-5">
        <div>
          <label for="name" class="block text-gray-700 font-semibold mb-2">Name</label>
          <input id="name" v-model="standort.Name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
        </div>
        <div>
          <label for="adresse" class="block text-gray-700 font-semibold mb-2">Adresse</label>
          <input id="adresse" v-model="standort.Adresse" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="plz" class="block text-gray-700 font-semibold mb-2">PLZ</label>
            <input id="plz" v-model="standort.PLZ" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div>
            <label for="ort" class="block text-gray-700 font-semibold mb-2">Ort</label>
            <input id="ort" v-model="standort.Ort" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>
        <div>
          <label for="land" class="block text-gray-700 font-semibold mb-2">Land</label>
          <input id="land" v-model="standort.Land" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="telefon" class="block text-gray-700 font-semibold mb-2">Telefon</label>
            <input id="telefon" v-model="standort.Telefon" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div>
            <label for="email" class="block text-gray-700 font-semibold mb-2">Email</label>
            <input id="email" v-model="standort.Email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
        </div>
        <div>
          <label for="typ" class="block text-gray-700 font-semibold mb-2">Typ</label>
          <select id="typ" v-model="standort.Typ" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="Filiale">Filiale</option>
            <option value="Zentrallager">Zentrallager</option>
            <option value="Verteilzentrum">Verteilzentrum</option>
            <option value="Verwaltung">Verwaltung</option>
          </select>
        </div>
        <div class="flex justify-end space-x-3 pt-4">
          <NuxtLink to="/standorte" class="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200">Abbrechen</NuxtLink>
          <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200">Erstellen</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const standort = ref({
  Name: '',
  Adresse: '',
  PLZ: '',
  Ort: '',
  Land: '',
  Telefon: '',
  Email: '',
  Typ: 'Filiale'
})

async function saveStandort() {
  try {
    await $fetch('/api/standorte', {
      method: 'POST',
      body: standort.value
    })
    router.push('/standorte')
  } catch (err) {
    alert('Fehler beim Erstellen des Standorts: ' + err.message)
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
