<template>
  <div class="min-h-screen flex flex-col" :class="{'bg-gray-50': !darkMode, 'bg-gray-800 text-white': darkMode}">
    <header class="p-4 flex justify-between items-center" :class="{'bg-teal-500': !darkMode, 'bg-teal-900': darkMode}">
      <h1 class="text-2xl font-bold">{{ $t('title') }}</h1>
      <div class="flex items-center space-x-2">
        <button class="md:hidden text-white focus:outline-none" @click="toggleMobileMenu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <button class="text-white focus:outline-none" @click="toggleDarkMode" :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path v-if="!darkMode" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.021 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        </button>
        <div class="relative">
          <button class="text-white focus:outline-none flex items-center" @click="toggleLanguageMenu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v12m1.51-5.49L15 15M8.49 9.51L3 15M3 15h12M9 21v-6"></path>
            </svg>
            <span class="ml-1">{{ currentLocaleName }}</span>
          </button>
          <div v-if="languageMenuOpen" class="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50" :class="{'bg-white text-gray-800': !darkMode, 'bg-gray-700 text-white': darkMode}">
            <div v-for="locale in locales" :key="locale.code" class="px-4 py-2 hover:bg-gray-200 cursor-pointer rounded-md" :class="{'hover:bg-gray-600': darkMode}" >
              <a class="block" href="#" @click.prevent="setLocale(locale.code) ; languageMenuOpen = false"> {{ locale.name }} </a>
              
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="flex flex-row flex-grow">
      <nav :class="[{ 'hidden': !mobileMenuOpen, 'block': mobileMenuOpen }, 'md:block text-white w-full md:w-64 p-4 absolute md:relative top-16 md:top-0 left-0 md:left-auto z-50', { 'bg-teal-400': !darkMode, 'bg-teal-800': darkMode }]">
        <ul class="space-y-2">
          <li>
            <NuxtLink to="/standorte" class="block p-2 rounded flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
              <span class="i-mdi-map-marker w-5 h-5 mr-2"></span> {{ $t('menu.locations') }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/produkte" class="block p-2 rounded flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
              <span class="i-mdi-package w-5 h-5 mr-2"></span> {{ $t('menu.products') }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/kunden" class="block p-2 rounded flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
              <span class="i-mdi-account-group w-5 h-5 mr-2"></span> {{ $t('menu.customers') }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/rechnungen" class="block p-2 rounded flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
              <span class="i-mdi-receipt w-5 h-5 mr-2"></span> {{ $t('menu.invoices') }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/lieferanten" class="block p-2 rounded flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
              <span class="i-mdi-truck w-5 h-5 mr-2"></span> {{ $t('menu.suppliers') }}
            </NuxtLink>
          </li>
          <li>
            <div class="block p-2 rounded cursor-pointer flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
              <span class="i-mdi-cog w-5 h-5 mr-2"></span> {{ $t('menu.settings') }}
            </div>
            <ul class="ml-6 space-y-1">
              <li>
                <NuxtLink to="/umsatzsteuersaetze" class="block p-1 rounded flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
                  <span class="i-mdi-currency-eur w-4 h-4 mr-1"></span> {{ $t('menu.vat') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/einheiten" class="block p-1 rounded flex items-center" :class="{'hover:bg-teal-600': !darkMode, 'hover:bg-teal-700': darkMode}" @click="closeMobileMenu">
                  <span class="i-mdi-ruler w-4 h-4 mr-1"></span> {{ $t('menu.unit') }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <main class="flex-grow p-4">
        <slot />
      </main>
    </div>
    <footer class="p-4 text-center" :class="{'bg-gray-100 text-gray-700': !darkMode, 'bg-gray-700 text-gray-300': darkMode}">
      <p>{{ $t('footer.copyright', { year: currentYear }) }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'


const { locale, locales, setLocale } = useI18n()
const currentYear = new Date().getFullYear()
const mobileMenuOpen = ref(false)
const darkMode = ref(false)
const languageMenuOpen = ref(false)

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value)
  return current ? current.name : 'Language'
})

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function toggleDarkMode() {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value.toString())
}

function toggleLanguageMenu() {
  languageMenuOpen.value = !languageMenuOpen.value
}


onMounted(() => {
  if (process.client) {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      darkMode.value = savedDarkMode === 'true'
    } else {
      // Check user's system preference
      darkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      localStorage.setItem('darkMode', darkMode.value.toString())
    }
    
  }
})
</script>

<style scoped>
/* Additional custom styles for dark mode input fields */
.bg-gray-900 input,
.bg-gray-900 textarea {
  background-color: #374151; /* gray-700 */
  color: #ffffff; /* white */
  border: 1px solid #4b5563; /* gray-600 */
}

.bg-gray-900 input:focus,
.bg-gray-900 textarea:focus {
  outline: none;
  border-color: #3b82f6; /* blue-500 */
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Ensure visibility of SVG spinner */
.i-svg-spinners\:blocks-wave {
  display: inline-block;
  width: 24px;
  height: 24px;
  color: currentColor; /* Use current text color for visibility */
}
</style>
