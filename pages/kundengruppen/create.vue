<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('kundengruppen.newGroup', 'Neue Kundengruppe') }}</h1>
    </div>

    <div class="card max-w-2xl">
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
  { label: t('menu.customerGroups', 'Kundengruppen'), to: '/kundengruppen' },
  { label: t('kundengruppen.newGroup', 'Neue Kundengruppe') }
])

const kundengruppe = ref({
  Name: '',
  Beschreibung: ''
})

const saving = ref(false)

async function saveKundengruppe() {
  if (!kundengruppe.value.Name.trim()) {
    toast.error(t('kundengruppen.nameRequired', 'Name ist erforderlich'))
    return
  }

  try {
    saving.value = true
    await $fetch('/api/kundengruppen', {
      method: 'POST',
      body: kundengruppe.value
    })
    toast.success(t('common.createSuccess', 'Erfolgreich erstellt'))
    navigateTo('/kundengruppen')
  } catch (err: any) {
    toast.error(t('kundengruppen.errorCreating', 'Fehler beim Erstellen der Kundengruppe'))
    console.error('Create Kundengruppe Error:', err)
  } finally {
    saving.value = false
  }
}
</script>
