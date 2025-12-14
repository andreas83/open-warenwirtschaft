<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kategorien.newCategory', 'Neue Kategorie') }}</h1>
    </div>

    <div class="card max-w-2xl">
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
              v-for="cat in parentKategorien"
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
            {{ $t('common.create', 'Erstellen') }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

const breadcrumbs = computed(() => [
  { label: t('menu.categories', 'Kategorien'), to: '/kategorien' },
  { label: t('kategorien.newCategory', 'Neue Kategorie') }
])

const kategorie = ref({
  Name: '',
  Beschreibung: '',
  UebergeordneteKategorieID: null as number | null
})

const parentKategorien = ref<any[]>([])
const saving = ref(false)

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
  if (!kategorie.value.Name.trim()) {
    toast.error(t('kategorien.nameRequired', 'Name ist erforderlich'))
    return
  }

  try {
    saving.value = true
    await $fetch('/api/produktkategorien', {
      method: 'POST',
      body: kategorie.value
    })
    toast.success(t('common.createSuccess', 'Erfolgreich erstellt'))
    navigateTo('/kategorien')
  } catch (err: any) {
    toast.error(t('kategorien.errorCreating', 'Fehler beim Erstellen der Kategorie'))
    console.error('Create Kategorie Error:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchParentKategorien()
})
</script>
