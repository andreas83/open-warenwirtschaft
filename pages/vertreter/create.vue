<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('vertreter.newRep', 'Neuer Vertreter') }}</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Personal Info -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.personalInfo', 'Personliche Daten') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.firstName', 'Vorname') }} *</label>
              <input v-model="vertreter.vorname" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.lastName', 'Nachname') }} *</label>
              <input v-model="vertreter.nachname" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.email', 'E-Mail') }} *</label>
              <input v-model="vertreter.email" type="email" class="input" required />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.phone', 'Telefon') }}</label>
              <input v-model="vertreter.telefon" type="tel" class="input" />
            </div>
          </div>
        </div>

        <!-- Work Details -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.workDetails', 'Arbeitsdetails') }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.region', 'Gebiet') }}</label>
              <input v-model="vertreter.gebiet" type="text" class="input" :placeholder="$t('vertreter.regionPlaceholder', 'z.B. Nord-Deutschland')" />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.commissionRate', 'Provisionssatz (%)') }}</label>
              <input v-model.number="vertreter.provisionssatz" type="number" min="0" max="100" step="0.01" class="input" />
            </div>
            <div>
              <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.hireDate', 'Einstellungsdatum') }}</label>
              <input v-model="vertreter.einstellungsdatum" type="date" class="input" />
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.status', 'Status') }}</h2>
          <select v-model="vertreter.status" class="input">
            <option value="Aktiv">{{ $t('vertreter.status.active', 'Aktiv') }}</option>
            <option value="Inaktiv">{{ $t('vertreter.status.inactive', 'Inaktiv') }}</option>
          </select>
        </div>

        <!-- Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.summary', 'Zusammenfassung') }}</h2>
          <div class="space-y-2 text-sm">
            <div v-if="vertreter.vorname || vertreter.nachname" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('vertreter.name', 'Name') }}</span>
              <span class="font-medium text-secondary-900">{{ vertreter.vorname }} {{ vertreter.nachname }}</span>
            </div>
            <div v-if="vertreter.gebiet" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('vertreter.region', 'Gebiet') }}</span>
              <span class="text-secondary-900">{{ vertreter.gebiet }}</span>
            </div>
            <div v-if="vertreter.provisionssatz" class="flex justify-between">
              <span class="text-secondary-600">{{ $t('vertreter.commissionRate', 'Provision') }}</span>
              <span class="text-secondary-900">{{ vertreter.provisionssatz }}%</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <Button :loading="saving" :disabled="!canSave" @click="saveVertreter">
            {{ $t('vertreter.createRep', 'Vertreter anlegen') }}
          </Button>
          <Button variant="secondary" @click="navigateTo('/vertreter')">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.representatives', 'Vertreter'), to: '/vertreter' },
  { label: t('vertreter.newRep', 'Neuer Vertreter') }
])

const vertreter = ref({
  vorname: '',
  nachname: '',
  email: '',
  telefon: '',
  gebiet: '',
  provisionssatz: null as number | null,
  status: 'Aktiv',
  einstellungsdatum: ''
})

const saving = ref(false)

const canSave = computed(() => {
  return vertreter.value.vorname && vertreter.value.nachname && vertreter.value.email
})

async function saveVertreter() {
  if (!canSave.value) return

  try {
    saving.value = true
    await $fetch('/api/vertreter', {
      method: 'POST',
      body: {
        vorname: vertreter.value.vorname,
        nachname: vertreter.value.nachname,
        email: vertreter.value.email,
        telefon: vertreter.value.telefon || null,
        gebiet: vertreter.value.gebiet || null,
        provisionssatz: vertreter.value.provisionssatz,
        status: vertreter.value.status,
        einstellungsdatum: vertreter.value.einstellungsdatum || null
      }
    })
    toast.success(t('vertreter.createSuccess', 'Vertreter erfolgreich angelegt'))
    navigateTo('/vertreter')
  } catch (err: any) {
    toast.error(t('vertreter.errorCreating', 'Fehler beim Anlegen des Vertreters'))
    console.error('Create Vertreter Error:', err)
  } finally {
    saving.value = false
  }
}
</script>
