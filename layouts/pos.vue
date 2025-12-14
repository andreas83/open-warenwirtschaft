<template>
  <div class="h-screen flex flex-col" :class="{'bg-gray-100': !darkMode, 'bg-gray-900 text-white': darkMode}">
    <!-- POS Header -->
    <header class="h-14 flex items-center justify-between px-4 border-b"
            :class="{'bg-white border-gray-200': !darkMode, 'bg-gray-800 border-gray-700': darkMode}">
      <div class="flex items-center gap-4">
        <NuxtLink
          :to="`/kassen/buchungen/${kassenId}`"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
          :class="{'hover:bg-gray-100 text-gray-700': !darkMode, 'hover:bg-gray-700 text-gray-300': darkMode}">
          <span class="i-mdi-arrow-left w-5 h-5"></span>
          <span class="hidden sm:inline">{{ $t('common.back') }}</span>
        </NuxtLink>
        <div class="h-6 w-px" :class="{'bg-gray-300': !darkMode, 'bg-gray-600': darkMode}"></div>
        <h1 class="text-lg font-bold flex items-center gap-2">
          <span class="i-mdi-cash-register w-6 h-6 text-indigo-500"></span>
          <span>{{ kassenName || 'POS' }}</span>
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <!-- Current Balance -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg"
             :class="{'bg-gray-100': !darkMode, 'bg-gray-700': darkMode}">
          <span class="text-sm" :class="{'text-gray-500': !darkMode, 'text-gray-400': darkMode}">{{ $t('kassen.currentBalance') }}:</span>
          <span class="font-bold text-indigo-600">{{ formatCurrency(kassenBestand) }}</span>
        </div>

        <!-- Dark Mode Toggle -->
        <button
          class="p-2 rounded-lg transition-colors"
          :class="{'hover:bg-gray-100': !darkMode, 'hover:bg-gray-700': darkMode}"
          @click="toggleDarkMode">
          <span v-if="!darkMode" class="i-mdi-weather-sunny w-5 h-5 text-yellow-500"></span>
          <span v-else class="i-mdi-weather-night w-5 h-5 text-blue-400"></span>
        </button>

        <!-- Fullscreen Toggle -->
        <button
          class="p-2 rounded-lg transition-colors"
          :class="{'hover:bg-gray-100': !darkMode, 'hover:bg-gray-700': darkMode}"
          @click="toggleFullscreen">
          <span v-if="!isFullscreen" class="i-mdi-fullscreen w-5 h-5"></span>
          <span v-else class="i-mdi-fullscreen-exit w-5 h-5"></span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const darkMode = ref(false)
const isFullscreen = ref(false)
const kassenId = ref(route.params.id || '')
const kassenName = ref('')
const kassenBestand = ref(0)

// Provide dark mode to child components
provide('darkMode', darkMode)
provide('kassenId', kassenId)

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  localStorage.setItem('posDarkMode', darkMode.value.toString())
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

async function fetchKassenInfo() {
  if (!kassenId.value) return
  try {
    const response = await $fetch(`/api/kassen?id=${kassenId.value}`)
    if (response.KassenID) {
      kassenName.value = response.Kassenbezeichnung
      kassenBestand.value = parseFloat(response.AktuellerBestand) || 0
    }
  } catch (err) {
    console.error('Error fetching kasse:', err)
  }
}

// Update kassen info from child
function updateKassenBestand(newBestand) {
  kassenBestand.value = newBestand
}

provide('updateKassenBestand', updateKassenBestand)

onMounted(() => {
  // Restore dark mode preference
  const savedDarkMode = localStorage.getItem('posDarkMode')
  if (savedDarkMode) {
    darkMode.value = savedDarkMode === 'true'
  }

  // Check fullscreen state
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })

  fetchKassenInfo()
})
</script>

<style scoped>
/* Prevent text selection for touch interface */
.h-screen {
  user-select: none;
  -webkit-user-select: none;
}
</style>
