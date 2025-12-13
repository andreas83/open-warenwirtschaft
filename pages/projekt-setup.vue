<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">{{ $t('projektSetup.title', 'Neues Projekt einrichten') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">
        {{ $t('projektSetup.subtitle', 'Wählen Sie eine Zielgruppe für Ihr Projekt aus') }}
      </p>
    </div>

    <!-- Step Indicator -->
    <div class="mb-8">
      <div class="flex items-center justify-center space-x-4">
        <div class="flex items-center">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            :class="step === 1 ? 'bg-primary-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
          >
            1
          </div>
          <span class="ml-2">{{ $t('projektSetup.step1', 'Zielgruppe') }}</span>
        </div>
        <div class="w-16 h-1 bg-gray-300 dark:bg-gray-700"></div>
        <div class="flex items-center">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            :class="step === 2 ? 'bg-primary-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
          >
            2
          </div>
          <span class="ml-2">{{ $t('projektSetup.step2', 'Details') }}</span>
        </div>
        <div class="w-16 h-1 bg-gray-300 dark:bg-gray-700"></div>
        <div class="flex items-center">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
            :class="step === 3 ? 'bg-primary-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'"
          >
            3
          </div>
          <span class="ml-2">{{ $t('projektSetup.step3', 'Bestätigung') }}</span>
        </div>
      </div>
    </div>

    <!-- Step 1: Audience Selection -->
    <div v-if="step === 1" class="space-y-6">
      <div v-if="loading" class="text-center py-12">
        <div class="i-svg-spinners-ring-resize text-6xl text-primary-500 mx-auto mb-4"></div>
        <p>{{ $t('common.loading', 'Laden...') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="template in audienceTemplates"
          :key="template.TemplateID"
          @click="selectAudience(template)"
          class="cursor-pointer border-2 rounded-lg p-6 transition-all hover:shadow-lg"
          :class="selectedTemplate?.TemplateID === template.TemplateID
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-primary-300'"
        >
          <div class="flex items-center mb-4">
            <div :class="template.Icon || 'i-heroicons-building-storefront'" class="text-4xl mr-3"></div>
            <h3 class="text-xl font-semibold">{{ template.DisplayName }}</h3>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {{ template.Beschreibung }}
          </p>
          <div class="text-xs text-gray-500">
            {{ template.ModuleKonfigurationen?.filter((m: any) => m.IstAktiviert).length || 0 }}
            {{ $t('projektSetup.modulesActive', 'Module aktiviert') }}
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-8">
        <button
          @click="nextStep"
          :disabled="!selectedTemplate"
          class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ $t('common.next', 'Weiter') }}
        </button>
      </div>
    </div>

    <!-- Step 2: Project Details -->
    <div v-if="step === 2" class="max-w-2xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6">{{ $t('projektSetup.projectDetails', 'Projektdetails') }}</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ $t('projektSetup.projectName', 'Projektname') }} *
            </label>
            <input
              v-model="projektData.ProjektName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
              :placeholder="$t('projektSetup.projectNamePlaceholder', 'Mein Unternehmen')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              {{ $t('projektSetup.companyName', 'Firmenname') }}
            </label>
            <input
              v-model="projektData.Firmenname"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
              :placeholder="$t('projektSetup.companyNamePlaceholder', 'Firmenname GmbH')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              {{ $t('projektSetup.industry', 'Branche') }}
            </label>
            <input
              v-model="projektData.Branche"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
              :placeholder="$t('projektSetup.industryPlaceholder', 'Handel, Gastronomie, etc.')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">
              {{ $t('projektSetup.description', 'Beschreibung') }}
            </label>
            <textarea
              v-model="projektData.Beschreibung"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
              :placeholder="$t('projektSetup.descriptionPlaceholder', 'Optional: Weitere Details zu Ihrem Projekt')"
            ></textarea>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex items-start">
              <div class="i-heroicons-information-circle text-blue-500 text-xl mr-3 mt-0.5"></div>
              <div>
                <h4 class="font-semibold mb-1">{{ $t('projektSetup.selectedTemplate', 'Ausgewählte Vorlage') }}</h4>
                <p class="text-sm">{{ selectedTemplate?.DisplayName }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {{ selectedTemplate?.Beschreibung }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-8">
          <button
            @click="prevStep"
            class="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {{ $t('common.back', 'Zurück') }}
          </button>
          <button
            @click="nextStep"
            :disabled="!projektData.ProjektName"
            class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ $t('common.next', 'Weiter') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Confirmation -->
    <div v-if="step === 3" class="max-w-3xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6">{{ $t('projektSetup.confirmation', 'Bestätigung') }}</h2>

        <div class="space-y-6">
          <div>
            <h3 class="font-semibold mb-2">{{ $t('projektSetup.projectInfo', 'Projektinformationen') }}</h3>
            <dl class="grid grid-cols-2 gap-4">
              <div>
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('projektSetup.projectName', 'Projektname') }}</dt>
                <dd class="font-medium">{{ projektData.ProjektName }}</dd>
              </div>
              <div v-if="projektData.Firmenname">
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('projektSetup.companyName', 'Firmenname') }}</dt>
                <dd class="font-medium">{{ projektData.Firmenname }}</dd>
              </div>
              <div v-if="projektData.Branche">
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('projektSetup.industry', 'Branche') }}</dt>
                <dd class="font-medium">{{ projektData.Branche }}</dd>
              </div>
              <div>
                <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('projektSetup.template', 'Vorlage') }}</dt>
                <dd class="font-medium">{{ selectedTemplate?.DisplayName }}</dd>
              </div>
            </dl>
            <div v-if="projektData.Beschreibung" class="mt-4">
              <dt class="text-sm text-gray-600 dark:text-gray-400">{{ $t('projektSetup.description', 'Beschreibung') }}</dt>
              <dd class="mt-1">{{ projektData.Beschreibung }}</dd>
            </div>
          </div>

          <div v-if="selectedTemplate?.ModuleKonfigurationen">
            <h3 class="font-semibold mb-3">{{ $t('projektSetup.activeModules', 'Aktivierte Module') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div
                v-for="config in selectedTemplate.ModuleKonfigurationen.filter((m: any) => m.IstAktiviert)"
                :key="config.KonfigID"
                class="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <div :class="config.ModulDefinition?.Icon || 'i-heroicons-cube'" class="text-2xl mr-2"></div>
                <div>
                  <div class="font-medium text-sm">{{ config.ModulDefinition?.DisplayName }}</div>
                  <div class="text-xs text-gray-500">
                    {{ config.Prioritaet === 'Erforderlich' ? '⭐ Erforderlich' :
                       config.Prioritaet === 'Wichtig' ? '🔶 Wichtig' : 'Optional' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="creating" class="text-center py-8">
            <div class="i-svg-spinners-ring-resize text-6xl text-primary-500 mx-auto mb-4"></div>
            <p>{{ $t('projektSetup.creating', 'Projekt wird erstellt...') }}</p>
          </div>
        </div>

        <div class="flex justify-between mt-8">
          <button
            @click="prevStep"
            :disabled="creating"
            class="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {{ $t('common.back', 'Zurück') }}
          </button>
          <button
            @click="createProject"
            :disabled="creating"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {{ $t('projektSetup.create', 'Projekt erstellen') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $i18n } = useNuxtApp();
const router = useRouter();

// State
const step = ref(1);
const loading = ref(true);
const creating = ref(false);
const audienceTemplates = ref<any[]>([]);
const selectedTemplate = ref<any>(null);
const projektData = ref({
  ProjektName: '',
  Beschreibung: '',
  Firmenname: '',
  Branche: '',
  AudienceTemplateID: null as number | null,
});

// Fetch audience templates
const fetchTemplates = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/audience-templates');
    audienceTemplates.value = data as any[];
  } catch (error) {
    console.error('Error fetching templates:', error);
  } finally {
    loading.value = false;
  }
};

// Methods
const selectAudience = (template: any) => {
  selectedTemplate.value = template;
  projektData.value.AudienceTemplateID = template.TemplateID;
};

const nextStep = () => {
  if (step.value < 3) {
    step.value++;
  }
};

const prevStep = () => {
  if (step.value > 1) {
    step.value--;
  }
};

const createProject = async () => {
  creating.value = true;
  try {
    const result = await $fetch('/api/projekte', {
      method: 'POST',
      body: projektData.value,
    });

    // Navigate to the project or home page
    router.push('/projekte');
  } catch (error) {
    console.error('Error creating project:', error);
    alert('Fehler beim Erstellen des Projekts');
  } finally {
    creating.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchTemplates();
});
</script>
