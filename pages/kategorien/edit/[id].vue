<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kategorien.editCategory', 'Kategorie bearbeiten') }}</h1>
    </div>

    <div v-if="loading" class="card p-12 text-center text-secondary-500">
      <span class="i-mdi-loading animate-spin w-8 h-8 mx-auto mb-4"></span>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <div v-else-if="error" class="card p-12 text-center text-danger-600">
      <span class="i-mdi-alert-circle w-8 h-8 mx-auto mb-4"></span>
      <p>{{ error }}</p>
      <Button variant="secondary" class="mt-4" @click="navigateTo('/kategorien')">
        {{ $t('common.back', 'Zurück') }}
      </Button>
    </div>

    <div v-else class="card max-w-2xl">
      <form @submit.prevent="saveKategorie" class="p-6 space-y-6">
        <div>
          <label for="name" class="block text-secondary-700 font-medium mb-2">
            {{ $t('kategorien.name', 'Name') }} *
          </label>
          <input
            id="name"
            v-model="kategorie.Name"
            type="text"
            class="input"
            required
          />
        </div>

        <div>
          <label for="beschreibung" class="block text-secondary-700 font-medium mb-2">
            {{ $t('kategorien.description', 'Beschreibung') }}
          </label>
          <textarea
            id="beschreibung"
            v-model="kategorie.Beschreibung"
            class="input min-h-24"
            rows="3"
          />
        </div>

        <div>
          <label for="parent" class="block text-secondary-700 font-medium mb-2">
            {{ $t('kategorien.parentCategory', 'Übergeordnete Kategorie') }}
          </label>
          <select
            id="parent"
            v-model="kategorie.UebergeordneteKategorieID"
            class="input"
          >
            <option :value="null">{{ $t('kategorien.noParent', 'Keine (Hauptkategorie)') }}</option>
            <option
              v-for="cat in availableParents"
              :key="cat.KategorieID"
              :value="cat.KategorieID"
            >
              {{ cat.Name }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button variant="secondary" @click="navigateTo('/kategorien')">
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
  { label: t('menu.categories', 'Kategorien'), to: '/kategorien' },
  { label: kategorie.value?.Name || t('kategorien.editCategory', 'Kategorie bearbeiten') }
])

const kategorie = ref<any>({
  Name: '',
  Beschreibung: '',
  UebergeordneteKategorieID: null
})

const parentKategorien = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

// Filter out current category and its children to prevent circular references
const availableParents = computed(() => {
  return parentKategorien.value.filter(cat => cat.KategorieID !== id.value)
})

async function fetchKategorie() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch(`/api/produktkategorien?id=${id.value}`)
    if (response?.status === 404) {
      error.value = t('kategorien.notFound', 'Kategorie nicht gefunden')
      return
    }
    kategorie.value = response
  } catch (err: any) {
    error.value = t('kategorien.errorLoading', 'Fehler beim Laden der Kategorie')
    console.error('Fetch Kategorie Error:', err)
  } finally {
    loading.value = false
  }
}

async function fetchParentKategorien() {
  try {
    const response = await $fetch('/api/produktkategorien')
    parentKategorien.value = Array.isArray(response) ? response : []
  } catch (err) {
    console.error('Fetch Parent Kategorien Error:', err)
    parentKategorien.value = []
  }
}

async function saveKategorie() {
  if (!kategorie.value.Name?.trim()) {
    toast.error(t('kategorien.nameRequired', 'Name ist erforderlich'))
    return
  }

  try {
    saving.value = true
    await $fetch(`/api/produktkategorien?id=${id.value}`, {
      method: 'PUT',
      body: {
        Name: kategorie.value.Name,
        Beschreibung: kategorie.value.Beschreibung,
        UebergeordneteKategorieID: kategorie.value.UebergeordneteKategorieID
      }
    })
    toast.success(t('common.saveSuccess', 'Erfolgreich gespeichert'))
    navigateTo('/kategorien')
  } catch (err: any) {
    toast.error(t('kategorien.errorSaving', 'Fehler beim Speichern der Kategorie'))
    console.error('Save Kategorie Error:', err)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchKategorie(), fetchParentKategorien()])
})
</script>
