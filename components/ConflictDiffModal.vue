<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-3/4 max-w-4xl max-h-[80vh] overflow-auto">
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{{ title }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ message }}</p>
      
      <div v-if="localData && serverData" class="mb-6">
        <h4 class="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">{{ $t('conflictModal.differences') }}</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg">
            <thead class="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('conflictModal.field') }}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('conflictModal.yourVersion') }}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('conflictModal.serverVersion') }}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{{ $t('conflictModal.action') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-600">
              <tr v-for="(field, index) in conflictingFields" :key="index" class="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ field }}</td>
                <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ getFieldValue(localData, field) }}</td>
                <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{{ getFieldValue(serverData, field) }}</td>
                <td class="px-4 py-2 text-sm">
                  <div class="flex gap-2">
                    <button type="button" @click="keepLocal(field)" class="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition duration-200 text-sm font-medium">{{ $t('conflictModal.keepLocal') }}</button>
                    <button type="button" @click="keepServer(field)" class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition duration-200 text-sm font-medium">{{ $t('conflictModal.keepServer') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button @click="cancel" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200">
          {{ cancelText }}
        </button>
        <button @click="confirm" class="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition duration-200">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Datenkonflikt'
  },
  message: {
    type: String,
    default: 'Die Daten wurden von einem anderen Benutzer geändert. Bitte überprüfen Sie die Unterschiede.'
  },
  confirmText: {
    type: String,
    default: 'Änderungen übernehmen'
  },
  cancelText: {
    type: String,
    default: 'Abbrechen'
  },
  localData: {
    type: Object,
    default: null
  },
  serverData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'cancel', 'updateResolution'])

const resolutions = ref({})

const conflictingFields = computed(() => {
  if (!props.localData || !props.serverData) return []
  const fields = Object.keys({...props.localData, ...props.serverData})
  return fields.filter(field => {
    const localVal = getFieldValue(props.localData, field)
    const serverVal = getFieldValue(props.serverData, field)
    return localVal !== serverVal && field !== 'ProduktID' && field !== 'createdAt' && field !== 'updatedAt'
  })
})

function getFieldValue(obj, field) {
  if (obj[field] === null || obj[field] === undefined) return ''
  return obj[field].toString()
}

function keepLocal(field) {
  resolutions.value[field] = { source: 'local', value: getFieldValue(props.localData, field) }
  emit('updateResolution', resolutions.value)
}

function keepServer(field) {
  resolutions.value[field] = { source: 'server', value: getFieldValue(props.serverData, field) }
  emit('updateResolution', resolutions.value)
}

const confirm = () => {
  emit('confirm', resolutions.value)
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
