<template>
  <div class="py-6">
    <Breadcrumbs :crumbs="breadcrumbs" />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold text-secondary-800">{{ $t('rabatte.newDiscount', 'Neuer Rabatt') }}</h1>
    </div>

    <div class="card max-w-2xl">
      <form @submit.prevent="saveRabatt" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label for="name" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.name', 'Name') }} *
            </label>
            <input
              id="name"
              v-model="rabatt.Name"
              type="text"
              class="input"
              required
            />
          </div>

          <div>
            <label for="rabattTyp" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.type', 'Rabatttyp') }} *
            </label>
            <select id="rabattTyp" v-model="rabatt.RabattTyp" class="input" required>
              <option value="Prozent">{{ $t('rabatte.typePercent', 'Prozent') }}</option>
              <option value="Betrag">{{ $t('rabatte.typeAmount', 'Fester Betrag') }}</option>
            </select>
          </div>

          <div>
            <label for="wert" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.value', 'Wert') }} *
            </label>
            <input
              id="wert"
              v-model.number="rabatt.Wert"
              type="number"
              min="0"
              step="0.01"
              class="input"
              required
            />
          </div>

          <div>
            <label for="anwendungsebene" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.scope', 'Anwendungsebene') }} *
            </label>
            <select id="anwendungsebene" v-model="rabatt.Anwendungsebene" class="input" required>
              <option value="Bestellung">{{ $t('rabatte.scopeOrder', 'Gesamte Bestellung') }}</option>
              <option value="Position">{{ $t('rabatte.scopeItem', 'Einzelne Position') }}</option>
              <option value="Kategorie">{{ $t('rabatte.scopeCategory', 'Kategorie') }}</option>
              <option value="Produkt">{{ $t('rabatte.scopeProduct', 'Produkt') }}</option>
            </select>
          </div>

          <div>
            <label for="status" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.status', 'Status') }}
            </label>
            <select id="status" v-model="rabatt.Status" class="input">
              <option value="Aktiv">{{ $t('rabatte.statusActive', 'Aktiv') }}</option>
              <option value="Inaktiv">{{ $t('rabatte.statusInactive', 'Inaktiv') }}</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label for="gutscheincode" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.couponCode', 'Gutscheincode') }}
            </label>
            <input
              id="gutscheincode"
              v-model="rabatt.Gutscheincode"
              type="text"
              class="input font-mono"
              :placeholder="$t('rabatte.couponCodePlaceholder', 'z.B. SOMMER20')"
            />
          </div>

          <div>
            <label for="gueltigAb" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.validFrom', 'Gultig ab') }}
            </label>
            <input
              id="gueltigAb"
              v-model="rabatt.GueltigAb"
              type="date"
              class="input"
            />
          </div>

          <div>
            <label for="gueltigBis" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.validUntil', 'Gultig bis') }}
            </label>
            <input
              id="gueltigBis"
              v-model="rabatt.GueltigBis"
              type="date"
              class="input"
            />
          </div>

          <div>
            <label for="mindestbestellwert" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.minOrderValue', 'Mindestbestellwert') }}
            </label>
            <input
              id="mindestbestellwert"
              v-model.number="rabatt.Mindestbestellwert"
              type="number"
              min="0"
              step="0.01"
              class="input"
            />
          </div>

          <div>
            <label for="maxNutzungen" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.maxUsage', 'Max. Nutzungen') }}
            </label>
            <input
              id="maxNutzungen"
              v-model.number="rabatt.MaxNutzungenGesamt"
              type="number"
              min="0"
              step="1"
              class="input"
            />
          </div>

          <div class="md:col-span-2">
            <label for="beschreibung" class="block text-secondary-700 font-medium mb-2">
              {{ $t('rabatte.description', 'Beschreibung') }}
            </label>
            <textarea
              id="beschreibung"
              v-model="rabatt.Beschreibung"
              class="input min-h-20"
              rows="3"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button variant="secondary" @click="navigateTo('/rabatte')">
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
  { label: t('menu.discounts', 'Rabatte'), to: '/rabatte' },
  { label: t('rabatte.newDiscount', 'Neuer Rabatt') }
])

const rabatt = ref({
  Name: '',
  Beschreibung: '',
  RabattTyp: 'Prozent',
  Anwendungsebene: 'Bestellung',
  Wert: 0,
  Mindestbestellwert: null as number | null,
  Gutscheincode: '',
  GueltigAb: '',
  GueltigBis: '',
  MaxNutzungenGesamt: null as number | null,
  Status: 'Aktiv'
})

const saving = ref(false)

async function saveRabatt() {
  if (!rabatt.value.Name.trim()) {
    toast.error(t('rabatte.nameRequired', 'Name ist erforderlich'))
    return
  }
  if (!rabatt.value.Wert || rabatt.value.Wert <= 0) {
    toast.error(t('rabatte.valueRequired', 'Wert muss grosser als 0 sein'))
    return
  }

  try {
    saving.value = true
    await $fetch('/api/rabatte', {
      method: 'POST',
      body: rabatt.value
    })
    toast.success(t('common.createSuccess', 'Erfolgreich erstellt'))
    navigateTo('/rabatte')
  } catch (err: any) {
    toast.error(t('rabatte.errorCreating', 'Fehler beim Erstellen des Rabatts'))
    console.error('Create Rabatt Error:', err)
  } finally {
    saving.value = false
  }
}
</script>
