<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ $t('standorte.editTitle') }}</h2>
<div v-if="loading" class="text-center text-gray-500 py-10">
  <div class="i-svg-spinners:blocks-wave inline-block" />
  {{ $t('standorte.loadingLocation') }}
</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <form @submit.prevent="saveStandort" class="space-y-5">
          <div>
            <label for="name" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.name') }}</label>
            <input id="name" v-model="standort.Name" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          </div>
          <div>
            <label for="adresse" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.address') }}</label>
            <input id="adresse" v-model="standort.Adresse" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="plz" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.zipCode') }}</label>
              <input id="plz" v-model="standort.PLZ" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
              <label for="ort" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.city') }}</label>
              <input id="ort" v-model="standort.Ort" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
          <div>
            <label for="land" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.country') }}</label>
            <input id="land" v-model="standort.Land" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="telefon" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.phone') }}</label>
              <input id="telefon" v-model="standort.Telefon" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            <div>
              <label for="email" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.email') }}</label>
              <input id="email" v-model="standort.Email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
          <div>
            <label for="typ" class="block text-gray-700 font-semibold mb-2">{{ $t('standorte.locationType') }}</label>
            <select id="typ" v-model="standort.Typ" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
<option value="Filiale">{{ $t('standorte.locationTypes.branch') }}</option>
<option value="Zentrallager">{{ $t('standorte.locationTypes.centralWarehouse') }}</option>
<option value="Verteilzentrum">{{ $t('standorte.locationTypes.distributionCenter') }}</option>
<option value="Verwaltung">{{ $t('standorte.locationTypes.administration') }}</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <NuxtLink to="/standorte" class="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition duration-200">{{ $t('produktForm.cancel') }}</NuxtLink>
            <button type="submit" class="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('produktForm.save') }}</button>
          </div>
        </form>
      </div>
      <ConfirmModal
        :show="showConfirmModal"
        title="Datenkonflikt"
        message="Die Daten wurden von einem anderen Benutzer geändert. Möchten Sie die neuesten Daten laden und Ihre Änderungen erneut versuchen?"
        confirmText="Ja, Daten laden"
        cancelText="Nein, abbrechen"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConfirmModal from '~/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const standort = ref({})
const loading = ref(true)
const error = ref(null)

async function fetchStandort() {
  try {
    loading.value = true
    const response = await $fetch(`/api/standorte?id=${id}`)
    if (response.status === 404) {
      error.value = 'Standort nicht gefunden'
    } else {
      standort.value = response
    }
  } catch (err) {
    error.value = $t('standorte.errorLoadingLocation') + err.message
  } finally {
    loading.value = false
  }
}

async function saveStandort() {
  try {
    let success = false;
    await $fetch(`/api/standorte?id=${id}`, {
      method: 'PUT',
      body: standort.value
    })
    success = true;
    if (success) {
      router.push('/standorte')
    }
  } catch (err) {
    if (err.status === 409) {
      showConfirmModal.value = true;
    } else {
      alert('Fehler beim Speichern des Standorts: ' + err.message)
    }
  }
}

function handleConfirm() {
  showConfirmModal.value = false;
  fetchStandort();
}

function handleCancel() {
  showConfirmModal.value = false;
}

const showConfirmModal = ref(false);

onMounted(fetchStandort)
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
