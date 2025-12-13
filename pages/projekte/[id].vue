<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="i-svg-spinners-ring-resize text-6xl text-primary-500 mx-auto mb-4"></div>
      <p>{{ $t('common.loading', 'Laden...') }}</p>
    </div>

    <!-- Project Details -->
    <div v-else-if="projekt" class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="flex items-center space-x-4 mb-2">
              <NuxtLink
                to="/projekte"
                class="text-gray-600 dark:text-gray-400 hover:text-primary-500"
              >
                <div class="i-heroicons-arrow-left text-xl"></div>
              </NuxtLink>
              <h1 class="text-3xl font-bold">{{ projekt.ProjektName }}</h1>
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="projekt.Status === 'Aktiv' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800'"
              >
                {{ projekt.Status }}
              </span>
            </div>
            <p v-if="projekt.Firmenname" class="text-gray-600 dark:text-gray-400">
              {{ projekt.Firmenname }}
            </p>
          </div>
          <button class="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div class="i-heroicons-pencil mr-2 inline"></div>
            {{ $t('common.edit', 'Bearbeiten') }}
          </button>
        </div>
      </div>

      <!-- Project Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center mb-2">
            <div class="i-heroicons-calendar text-2xl text-primary-500 mr-3"></div>
            <h3 class="font-semibold">{{ $t('projekte.created', 'Erstellt') }}</h3>
          </div>
          <p class="text-2xl font-bold">{{ new Date(projekt.Erstelldatum).toLocaleDateString() }}</p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center mb-2">
            <div class="i-heroicons-cube text-2xl text-primary-500 mr-3"></div>
            <h3 class="font-semibold">{{ $t('projekte.activeModules', 'Aktive Module') }}</h3>
          </div>
          <p class="text-2xl font-bold">{{ projekt.ProjektModule?.filter((m: any) => m.IstAktiviert).length || 0 }}</p>
        </div>

        <div v-if="projekt.AudienceTemplate" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center mb-2">
            <div :class="projekt.AudienceTemplate.Icon || 'i-heroicons-building-storefront'" class="text-2xl text-primary-500 mr-3"></div>
            <h3 class="font-semibold">{{ $t('projekte.template', 'Vorlage') }}</h3>
          </div>
          <p class="text-lg font-bold">{{ projekt.AudienceTemplate.DisplayName }}</p>
        </div>
      </div>

      <!-- Description -->
      <div v-if="projekt.Beschreibung" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h3 class="font-semibold mb-3">{{ $t('projekte.description', 'Beschreibung') }}</h3>
        <p class="text-gray-600 dark:text-gray-400">{{ projekt.Beschreibung }}</p>
      </div>

      <!-- Modules Configuration -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-2xl font-semibold mb-6">{{ $t('projekte.moduleConfiguration', 'Modulkonfiguration') }}</h3>

        <!-- Group modules by category -->
        <div v-if="modulesByCategory && Object.keys(modulesByCategory).length > 0" class="space-y-6">
          <div v-for="(modules, category) in modulesByCategory" :key="category">
            <h4 class="font-semibold text-lg mb-3 flex items-center">
              <div class="i-heroicons-folder text-primary-500 mr-2"></div>
              {{ category }}
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="modulConfig in modules"
                :key="modulConfig.ProjektModulID"
                class="border rounded-lg p-4"
                :class="modulConfig.IstAktiviert
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-700 opacity-60'"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-center flex-1">
                    <div :class="modulConfig.ModulDefinition?.Icon || 'i-heroicons-cube'" class="text-3xl mr-3"></div>
                    <div>
                      <h5 class="font-medium">{{ modulConfig.ModulDefinition?.DisplayName }}</h5>
                      <p class="text-xs text-gray-600 dark:text-gray-400">
                        {{ modulConfig.ModulDefinition?.Beschreibung }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="toggleModule(modulConfig)"
                    class="ml-2"
                    :class="modulConfig.IstAktiviert ? 'text-green-600' : 'text-gray-400'"
                  >
                    <div :class="modulConfig.IstAktiviert ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" class="text-2xl"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          {{ $t('projekte.noModules', 'Keine Module konfiguriert') }}
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-16">
      <div class="i-heroicons-exclamation-triangle text-6xl text-yellow-500 mx-auto mb-4"></div>
      <h3 class="text-xl font-semibold mb-2">{{ $t('projekte.notFound', 'Projekt nicht gefunden') }}</h3>
      <NuxtLink to="/projekte" class="text-primary-500 hover:underline">
        {{ $t('common.backToList', 'Zurück zur Liste') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const projektId = computed(() => parseInt(route.params.id as string));

const loading = ref(true);
const projekt = ref<any>(null);

// Computed: Group modules by category
const modulesByCategory = computed(() => {
  if (!projekt.value?.ProjektModule) return {};

  const grouped: Record<string, any[]> = {};
  projekt.value.ProjektModule.forEach((mod: any) => {
    const category = mod.ModulDefinition?.Kategorie || 'Andere';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(mod);
  });

  return grouped;
});

// Fetch project
const fetchProjekt = async () => {
  loading.value = true;
  try {
    const data = await $fetch(`/api/projekte/${projektId.value}`);
    projekt.value = data;
  } catch (error) {
    console.error('Error fetching project:', error);
  } finally {
    loading.value = false;
  }
};

// Toggle module activation
const toggleModule = async (modulConfig: any) => {
  // TODO: Implement API call to toggle module
  console.log('Toggle module:', modulConfig);
  modulConfig.IstAktiviert = !modulConfig.IstAktiviert;
};

// Lifecycle
onMounted(() => {
  fetchProjekt();
});
</script>
