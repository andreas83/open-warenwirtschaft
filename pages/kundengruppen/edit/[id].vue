<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kundengruppen.editGroup', 'Kundengruppe bearbeiten') }}</h1>
    </div>

    <div v-if="loading" class="card p-12 text-center text-secondary-500">
      <span class="i-mdi-loading animate-spin w-8 h-8 mx-auto mb-4"></span>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <div v-else-if="error" class="card p-12 text-center text-danger-600">
      <span class="i-mdi-alert-circle w-8 h-8 mx-auto mb-4"></span>
      <p>{{ error }}</p>
      <Button variant="secondary" class="mt-4" @click="navigateTo('/kundengruppen')">
        {{ $t('common.back', 'Zuruck') }}
      </Button>
    </div>

    <div v-else class="card max-w-2xl">
      <form @submit.prevent="saveKundengruppe" class="p-6 space-y-6">
        <div>
          <label for="name" class="block text-secondary-700 font-medium mb-2">
            {{ $t('kundengruppen.name', 'Name') }} *
          </label>
          <input
            id="name"
            v-model="kundengruppe.Name"
            type="text"
            class="input"
            required
          />
        </div>

        <div>
          <label for="beschreibung" class="block text-secondary-700 font-medium mb-2">
            {{ $t('kundengruppen.description', 'Beschreibung') }}
          </label>
          <textarea
            id="beschreibung"
            v-model="kundengruppe.Beschreibung"
            class="input min-h-24"
            rows="4"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button variant="secondary" @click="navigateTo('/kundengruppen')">
            {{ $t('common.cancel', 'Abbrechen') }}
          </Button>
          <Button type="submit" :loading="saving">
            {{ $t('common.save', 'Speichern') }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const route = useRoute()

const id = computed(() => parseInt(route.params.id as string))

const breadcrumbs = computed(() => [
  { label: t('menu.customerGroups', 'Kundengruppen'), to: '/kundengruppen' },
  { label: kundengruppe.value?.Name || t('kundengruppen.editGroup', 'Bearbeiten') }
])

const kundengruppe = ref<any>({
  Name: '',
  Beschreibung: ''
})

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

async function fetchKundengruppe() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch('/api/kundengruppen')
    const groups = Array.isArray(response) ? response : []
    const group = groups.find((g: any) => g.KundengruppeID === id.value)
    if (!group) {
      error.value = t('kundengruppen.notFound', 'Kundengruppe nicht gefunden')
      return
    }
    kundengruppe.value = group
  } catch (err: any) {
    error.value = t('kundengruppen.errorLoading', 'Fehler beim Laden der Kundengruppe')
    console.error('Fetch Kundengruppe Error:', err)
  } finally {
    loading.value = false
  }
}

async function saveKundengruppe() {
  if (!kundengruppe.value.Name?.trim()) {
    toast.error(t('kundengruppen.nameRequired', 'Name ist erforderlich'))
    return
  }

  try {
    saving.value = true
    await $fetch(`/api/kundengruppen?id=${id.value}`, {
      method: 'PUT',
      body: {
        Name: kundengruppe.value.Name,
        Beschreibung: kundengruppe.value.Beschreibung
      }
    })
    toast.success(t('common.saveSuccess', 'Erfolgreich gespeichert'))
    navigateTo('/kundengruppen')
  } catch (err: any) {
    toast.error(t('kundengruppen.errorSaving', 'Fehler beim Speichern der Kundengruppe'))
    console.error('Save Kundengruppe Error:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchKundengruppe()
})
</script>
