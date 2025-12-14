<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div v-if="loading" class="card p-12 text-center text-secondary-500">
      <span class="i-mdi-loading animate-spin w-8 h-8 mx-auto mb-4"></span>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <div v-else-if="error" class="card p-12 text-center text-danger-600">
      <span class="i-mdi-alert-circle w-8 h-8 mx-auto mb-4"></span>
      <p>{{ error }}</p>
      <Button variant="secondary" class="mt-4" @click="navigateTo('/vertreter')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <template v-else>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-secondary-800">{{ vertreter.Vorname }} {{ vertreter.Nachname }}</h1>
          <p class="text-secondary-500">{{ vertreter.Vertreternummer }}</p>
        </div>
        <span :class="getStatusBadgeClass(vertreter.Status)" class="text-base">
          {{ formatStatus(vertreter.Status) }}
        </span>
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
                <input v-model="vertreter.Vorname" type="text" class="input" required />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.lastName', 'Nachname') }} *</label>
                <input v-model="vertreter.Nachname" type="text" class="input" required />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.email', 'E-Mail') }} *</label>
                <input v-model="vertreter.Email" type="email" class="input" required />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.phone', 'Telefon') }}</label>
                <input v-model="vertreter.Telefon" type="tel" class="input" />
              </div>
            </div>
          </div>

          <!-- Work Details -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.workDetails', 'Arbeitsdetails') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.region', 'Gebiet') }}</label>
                <input v-model="vertreter.Gebiet" type="text" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.commissionRate', 'Provisionssatz (%)') }}</label>
                <input v-model.number="vertreter.Provisionssatz" type="number" min="0" max="100" step="0.01" class="input" />
              </div>
              <div>
                <label class="block text-secondary-700 font-medium mb-2">{{ $t('vertreter.hireDate', 'Einstellungsdatum') }}</label>
                <input v-model="formattedEinstellungsdatum" type="date" class="input" />
              </div>
            </div>
          </div>

          <!-- Assigned Customers -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.assignedCustomers', 'Zugewiesene Kunden') }}</h2>

            <div v-if="!vertreter.KundenVertreter?.length" class="text-center py-8 text-secondary-500">
              {{ $t('vertreter.noCustomers', 'Keine Kunden zugewiesen') }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="kv in vertreter.KundenVertreter"
                :key="kv.KundenVertreterID"
                class="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full">
                    <span class="i-mdi-account"></span>
                  </div>
                  <div>
                    <div class="font-medium text-secondary-900">{{ kv.Kunden?.Firmenname || kv.Kunden?.Vorname + ' ' + kv.Kunden?.Nachname }}</div>
                    <div class="text-sm text-secondary-500">{{ kv.Kunden?.Kundennummer }}</div>
                  </div>
                </div>
                <div class="text-sm text-secondary-500">
                  {{ $t('vertreter.since', 'Seit') }} {{ formatDate(kv.GueltigAb) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Commissions -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.recentCommissions', 'Letzte Provisionen') }}</h2>

            <div v-if="!vertreter.Provisionen?.length" class="text-center py-8 text-secondary-500">
              {{ $t('vertreter.noCommissions', 'Keine Provisionen') }}
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="prov in vertreter.Provisionen"
                :key="prov.ProvisionID"
                class="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"
              >
                <div>
                  <div class="font-medium text-secondary-900">{{ formatDate(prov.Berechnungsdatum) }}</div>
                  <div class="text-sm text-secondary-500">
                    <span :class="getProvisionStatusBadge(prov.Status)">{{ prov.Status }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-primary-600">{{ formatCurrency(prov.Provisionsbetrag) }}</div>
                  <div class="text-sm text-secondary-500">
                    {{ prov.Provisionssatz }}% {{ $t('vertreter.ofSales', 'von') }} {{ formatCurrency(prov.Basisbetrag) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.status', 'Status') }}</h2>
            <select v-model="vertreter.Status" class="input">
              <option value="Aktiv">{{ $t('vertreter.status.active', 'Aktiv') }}</option>
              <option value="Inaktiv">{{ $t('vertreter.status.inactive', 'Inaktiv') }}</option>
              <option value="Gekuendigt">{{ $t('vertreter.status.terminated', 'Gekundigt') }}</option>
            </select>
          </div>

          <!-- Stats -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-secondary-800 mb-4">{{ $t('vertreter.statistics', 'Statistik') }}</h2>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-secondary-600">{{ $t('vertreter.customers', 'Kunden') }}</span>
                <span class="font-medium text-secondary-900">{{ vertreter.KundenVertreter?.length || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-secondary-600">{{ $t('vertreter.totalCommissions', 'Provisionen') }}</span>
                <span class="font-medium text-secondary-900">{{ vertreter.Provisionen?.length || 0 }}</span>
              </div>
              <div v-if="vertreter.Erstelldatum" class="flex justify-between items-center">
                <span class="text-secondary-600">{{ $t('vertreter.created', 'Angelegt') }}</span>
                <span class="text-secondary-900">{{ formatDate(vertreter.Erstelldatum) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <Button :loading="saving" @click="saveVertreter">
              {{ $t('common.save', 'Speichern') }}
            </Button>
            <Button variant="secondary" @click="navigateTo('/vertreter')">
              {{ $t('common.cancel', 'Abbrechen') }}
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const toast = useToast()
const route = useRoute()

const id = computed(() => parseInt(route.params.id as string))

const vertreter = ref<any>({})
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

const breadcrumbs = computed(() => [
  { label: t('menu.representatives', 'Vertreter'), to: '/vertreter' },
  { label: vertreter.value?.Vertreternummer || t('vertreter.editRep', 'Bearbeiten') }
])

const formattedEinstellungsdatum = computed({
  get: () => vertreter.value.Einstellungsdatum ? new Date(vertreter.value.Einstellungsdatum).toISOString().split('T')[0] : '',
  set: (val) => { vertreter.value.Einstellungsdatum = val }
})

async function fetchVertreter() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/vertreter?id=${id.value}`)
    if (!response || response.status === 404) {
      error.value = t('vertreter.notFound', 'Vertreter nicht gefunden')
      return
    }
    vertreter.value = response
  } catch (err: any) {
    error.value = t('vertreter.errorLoading', 'Fehler beim Laden des Vertreters')
    console.error('Fetch Vertreter Error:', err)
  } finally {
    loading.value = false
  }
}

async function saveVertreter() {
  try {
    saving.value = true
    await $fetch(`/api/vertreter?id=${id.value}`, {
      method: 'PUT',
      body: {
        vorname: vertreter.value.Vorname,
        nachname: vertreter.value.Nachname,
        email: vertreter.value.Email,
        telefon: vertreter.value.Telefon,
        gebiet: vertreter.value.Gebiet,
        provisionssatz: vertreter.value.Provisionssatz,
        status: vertreter.value.Status,
        einstellungsdatum: formattedEinstellungsdatum.value || null
      }
    })
    toast.success(t('vertreter.saveSuccess', 'Vertreter erfolgreich gespeichert'))
    navigateTo('/vertreter')
  } catch (err: any) {
    toast.error(t('vertreter.errorSaving', 'Fehler beim Speichern des Vertreters'))
    console.error('Save Vertreter Error:', err)
  } finally {
    saving.value = false
  }
}

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString(locale.value === 'de' ? 'de-DE' : 'en-US')
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(locale.value === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Aktiv': 'Aktiv',
    'Inaktiv': 'Inaktiv',
    'Gekuendigt': 'Gekundigt'
  }
  return statusMap[status] || status
}

function getStatusBadgeClass(status: string): string {
  const baseClass = 'badge'
  switch (status) {
    case 'Aktiv': return `${baseClass} badge-success`
    case 'Inaktiv': return `${baseClass} badge-warning`
    case 'Gekuendigt': return `${baseClass} badge-danger`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

function getProvisionStatusBadge(status: string): string {
  const baseClass = 'badge text-xs'
  switch (status) {
    case 'Offen': return `${baseClass} badge-warning`
    case 'Berechnet': return `${baseClass} badge-info`
    case 'Ausgezahlt': return `${baseClass} badge-success`
    case 'Storniert': return `${baseClass} badge-danger`
    default: return `${baseClass} bg-secondary-100 text-secondary-700`
  }
}

onMounted(() => {
  fetchVertreter()
})
</script>
