<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Kunde Bearbeiten</h2>
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-12">Lade Kunde...</div>
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 max-w-5xl mx-auto">
        <form @submit.prevent="saveKunde" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firmenname" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Firmenname (Name)</label>
              <input id="firmenname" v-model="firmenname" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
            </div>
            <div>
              <label for="kundennummer" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Kundennummer</label>
              <input id="kundennummer" v-model="kunde.Kundennummer" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="anrede" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Anrede</label>
              <input id="anrede" v-model="kunde.Anrede" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="vorname" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Vorname</label>
              <input id="vorname" v-model="kunde.Vorname" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="nachname" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Nachname</label>
              <input id="nachname" v-model="kunde.Nachname" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="telefon" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Telefon</label>
              <input id="telefon" v-model="kunde.Telefon" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="email" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email</label>
              <input id="email" v-model="kunde.Email" type="email" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
          </div>
          <div>
            <label for="adresse" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Adresse</label>
            <textarea id="adresse" v-model="kunde.Adresse" rows="3" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="plz" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">PLZ</label>
              <input id="plz" v-model="kunde.PLZ" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="ort" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Ort</label>
              <input id="ort" v-model="kunde.Ort" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="land" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Land</label>
              <input id="land" v-model="kunde.Land" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
            <div>
              <label for="kundengruppe" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Kundengruppe</label>
              <Autocomplete
                id="kundengruppe"
                :items="kundengruppen"
                id-key="KundengruppeID"
                :display-fn="item => `${item.Name}`"
                :filter-fn="(item, search) => item.Name.toLowerCase().includes(search.toLowerCase())"
                :initial-value="kundengruppeSearch"
                placeholder="Kundengruppe suchen..."
                @select="selectKundengruppe"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="umsatzsteuerID" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Umsatzsteuer ID</label>
              <input id="umsatzsteuerID" v-model="kunde.UmsatzsteuerID" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" @input="validateVat">
              <p v-if="vatError" class="text-red-500 text-sm mt-1">{{ vatError }}</p>
            </div>
            <div>
              <label for="zahlungsbedingungen" class="block text-gray-700 dark:text-gray-300 font-medium mb-2">Zahlungsbedingungen</label>
              <input id="zahlungsbedingungen" v-model="kunde.Zahlungsbedingungen" type="text" class="w-full border border-gray-200 dark:border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-6">
            <NuxtLink to="/kunden" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</NuxtLink>
            <button type="submit" class="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200 text-sm font-medium">Speichern</button>
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

const kunde = ref({})
const kundengruppen = ref([])
const loading = ref(true)
const error = ref(null)
const kundengruppeSearch = ref('')
const vatError = ref('')

async function fetchKunde() {
  try {
    loading.value = true
    const response = await $fetch(`/api/kunden?id=${id}`)
    if (response.status === 404) {
      error.value = 'Kunde nicht gefunden'
    } else {
      kunde.value = response
      setInitialAutocompleteValues()
    }
  } catch (err) {
    error.value = 'Fehler beim Laden des Kunden: ' + err.message
  } finally {
    loading.value = false
  }
}

async function fetchKundengruppen() {
  try {
    const response = await $fetch(`/api/kundengruppen`)
    kundengruppen.value = response
  } catch (err) {
    console.error('Fehler beim Laden der Kundengruppen:', err.message)
  }
}

function selectKundengruppe(gruppe) {
  if (gruppe) {
    kunde.value.KundengruppeID = gruppe.KundengruppeID
    kundengruppeSearch.value = gruppe.Name
  } else {
    kunde.value.KundengruppeID = null
    kundengruppeSearch.value = ''
  }
}

function validateVat() {
  const vatPattern = /^[A-Z]{2}\d{8,12}$/;
  if (kunde.value.UmsatzsteuerID && !vatPattern.test(kunde.value.UmsatzsteuerID)) {
    vatError.value = 'Ungültiges Umsatzsteuer-ID-Format. Erwartet: zwei Buchstaben gefolgt von 8-12 Ziffern (z.B. AT12345678)';
  } else {
    vatError.value = '';
  }
}

async function saveKunde() {
  try {
    // Ensure Firmenname is saved back to the correct field
    if (kunde.value.Firmenname !== undefined) {
      kunde.value.Firmenname = kunde.value.Firmenname || kunde.value.Name;
    } else {
      kunde.value.Name = kunde.value.Name || kunde.value.Firmenname;
    }
    let success = false;
    await $fetch(`/api/kunden?id=${id}`, {
      method: 'PUT',
      body: kunde.value
    })
    success = true;
    if (success) {
      router.push('/kunden')
    }
  } catch (err) {
    if (err.status === 409) {
      showConfirmModal.value = true;
    } else {
      alert('Fehler beim Speichern des Kunden: ' + err.message)
    }
  }
}

function handleConfirm() {
  showConfirmModal.value = false;
  fetchKunde();
}

function handleCancel() {
  showConfirmModal.value = false;
}

import { computed } from 'vue'

const firmenname = computed({
  get() {
    return kunde.value.Firmenname || kunde.value.Name || '';
  },
  set(value) {
    if (kunde.value.Firmenname !== undefined) {
      kunde.value.Firmenname = value;
    } else {
      kunde.value.Name = value;
    }
  }
});

import Autocomplete from '~/components/Autocomplete.vue'

function setInitialAutocompleteValues() {
  kundengruppeSearch.value = kunde.value.KundengruppeID && kundengruppen.value.length > 0 ? kundengruppen.value.find(g => g.KundengruppeID === kunde.value.KundengruppeID)?.Name || '' : ''
}

const showConfirmModal = ref(false);

onMounted(async () => {
  await Promise.all([
    fetchKundengruppen()
  ])
  await fetchKunde()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
