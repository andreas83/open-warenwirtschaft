<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">{{ $t('projekte.title', 'Projekte') }}</h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('projekte.subtitle', 'Verwalten Sie Ihre Projekte und deren Konfiguration') }}
        </p>
      </div>
      <NuxtLink
        to="/projekt-setup"
        class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
      >
        <div class="i-heroicons-plus mr-2"></div>
        {{ $t('projekte.new', 'Neues Projekt') }}
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="i-svg-spinners-ring-resize text-6xl text-primary-500 mx-auto mb-4"></div>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <!-- Projects List -->
    <div v-else-if="projekte.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="projekt in projekte"
        :key="projekt.ProjektID"
        class="border border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-1">{{ projekt.ProjektName }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ projekt.Firmenname || projekt.Branche || 'Keine Branche angegeben' }}
            </p>
          </div>
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="projekt.Status === 'Aktiv' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
          >
            {{ projekt.Status }}
          </span>
        </div>

        <div v-if="projekt.Beschreibung" class="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {{ projekt.Beschreibung }}
        </div>

        <div v-if="projekt.AudienceTemplate" class="mb-4 flex items-center text-sm">
          <div :class="projekt.AudienceTemplate.Icon || 'i-heroicons-building-storefront'" class="text-2xl mr-2"></div>
          <span class="font-medium">{{ projekt.AudienceTemplate.DisplayName }}</span>
        </div>

        <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span>{{ projekt.ProjektModule?.filter((m: any) => m.IstAktiviert).length || 0 }} Module aktiv</span>
          <span>{{ new Date(projekt.Erstelldatum).toLocaleDateString() }}</span>
        </div>

        <div class="flex space-x-2">
          <NuxtLink
            :to="`/projekte/${projekt.ProjektID}`"
            class="flex-1 px-4 py-2 bg-primary-500 text-white text-center rounded-lg hover:bg-primary-600 transition-colors"
          >
            {{ $t('common.details', 'Details') }}
          </NuxtLink>
          <button
            class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="i-heroicons-cog-6-tooth"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="i-heroicons-folder-open text-6xl text-gray-400 mx-auto mb-4"></div>
      <h3 class="text-xl font-semibold mb-2">{{ $t('projekte.noProjects', 'Keine Projekte vorhanden') }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ $t('projekte.createFirst', 'Erstellen Sie Ihr erstes Projekt um zu beginnen') }}
      </p>
      <NuxtLink
        to="/projekt-setup"
        class="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        <div class="i-heroicons-plus mr-2"></div>
        {{ $t('projekte.new', 'Neues Projekt') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true);
const projekte = ref<any[]>([]);

// Fetch projects
const fetchProjekte = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/projekte');
    projekte.value = data as any[];
  } catch (error) {
    console.error('Error fetching projects:', error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchProjekte();
});
</script>
