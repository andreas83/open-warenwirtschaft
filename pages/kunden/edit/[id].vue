<template>
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <Breadcrumbs :crumbs="breadcrumbs" />
    <h2 class="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Kunde Bearbeiten</h2>
    <LoadingSpinner v-if="loading" center text="Lade Kunde..." />
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 py-12">{{ error }}</div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl p-6 max-w-5xl mx-auto">
        <form @submit.prevent="saveKunde" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="firmenname"
              label="Firmenname (Name)"
              type="text"
              placeholder="Firmenname eingeben..."
              required
            />
            <FormInput
              v-model="kunde.Kundennummer"
              label="Kundennummer"
              type="text"
              placeholder="Kundennummer eingeben..."
              required
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              v-model="kunde.Anrede"
              label="Anrede"
              type="text"
              placeholder="z.B. Herr, Frau..."
            />
            <FormInput
              v-model="kunde.Vorname"
              label="Vorname"
              type="text"
              placeholder="Vorname eingeben..."
            />
            <FormInput
              v-model="kunde.Nachname"
              label="Nachname"
              type="text"
              placeholder="Nachname eingeben..."
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="kunde.Telefon"
              label="Telefon"
              type="text"
              placeholder="Telefonnummer eingeben..."
            />
            <FormInput
              v-model="kunde.Email"
              label="Email"
              type="email"
              placeholder="Email-Adresse eingeben..."
            />
          </div>
          <FormTextarea
            v-model="kunde.Adresse"
            label="Adresse"
            rows="3"
            placeholder="Adresse eingeben..."
          />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="kunde.PLZ"
              label="PLZ"
              type="text"
              placeholder="Postleitzahl eingeben..."
            />
            <FormInput
              v-model="kunde.Ort"
              label="Ort"
              type="text"
              placeholder="Ort eingeben..."
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="kunde.Land"
              label="Land"
              type="text"
              placeholder="Land eingeben..."
            />
            <div>
              <label for="kundengruppe" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kundengruppe</label>
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
            <FormInput
              v-model="kunde.UmsatzsteuerID"
              label="Umsatzsteuer ID"
              type="text"
              placeholder="z.B. AT12345678"
              :error="vatError"
              @input="validateVat"
            />
            <FormInput
              v-model="kunde.Zahlungsbedingungen"
              label="Zahlungsbedingungen"
              type="text"
              placeholder="Zahlungsbedingungen eingeben..."
            />
          </div>
          <div class="flex justify-end space-x-3 pt-6">
            <NuxtLink to="/kunden" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200 text-sm font-medium">Abbrechen</NuxtLink>
            <LoadingButton type="submit" variant="primary" :loading="isSaving">
              Speichern
            </LoadingButton>
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
    <Toast
      v-if="toast.visible"
      :message="toast.message"
      :type="toast.type"
      @close="toast.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const id = route.params.id

const breadcrumbs = computed(() => [
  { label: 'Kunden', to: '/kunden' },
  { label: kunde.value?.Kundennummer || 'Bearbeiten' }
])

const kunde = ref({})
const kundengruppen = ref([])
const loading = ref(true)
const error = ref(null)
const kundengruppeSearch = ref('')
const vatError = ref('')
const isSaving = ref(false)
const toast = ref({
  visible: false,
  message: '',
  type: 'info'
})
const showConfirmModal = ref(false)

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

function showToast(message, type = 'info') {
  toast.value = {
    visible: true,
    message,
    type
  }
}

async function saveKunde() {
  try {
    isSaving.value = true
    // Ensure Firmenname is saved back to the correct field
    if (kunde.value.Firmenname !== undefined) {
      kunde.value.Firmenname = kunde.value.Firmenname || kunde.value.Name;
    } else {
      kunde.value.Name = kunde.value.Name || kunde.value.Firmenname;
    }
    await $fetch(`/api/kunden?id=${id}`, {
      method: 'PUT',
      body: kunde.value
    })
    showToast('Kunde erfolgreich aktualisiert', 'success')
    setTimeout(() => {
      router.push('/kunden')
    }, 1000)
  } catch (err) {
    if (err.status === 409) {
      showConfirmModal.value = true;
    } else {
      showToast('Fehler beim Speichern des Kunden: ' + err.message, 'error')
    }
  } finally {
    isSaving.value = false
  }
}

function handleConfirm() {
  showConfirmModal.value = false;
  fetchKunde();
}

function handleCancel() {
  showConfirmModal.value = false;
}

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

function setInitialAutocompleteValues() {
  kundengruppeSearch.value = kunde.value.KundengruppeID && kundengruppen.value.length > 0 ? kundengruppen.value.find(g => g.KundengruppeID === kunde.value.KundengruppeID)?.Name || '' : ''
}

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
