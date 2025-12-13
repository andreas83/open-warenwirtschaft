<template>
  <div class="min-h-screen flex flex-col" :class="{'bg-gray-50': !darkMode, 'bg-gray-900 text-white': darkMode}">
    <!-- Modern Header with Glass Morphism -->
    <header class="sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300"
            :class="{'bg-white/90 border-gray-200': !darkMode, 'bg-gray-800/90 border-gray-700': darkMode}">
      <div class="px-4 lg:px-6 h-16 flex justify-between items-center">
        <!-- Left: Sidebar toggle + Title -->
        <div class="flex items-center gap-4">
          <button
            class="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            :class="{'hover:bg-gray-100': !darkMode, 'hover:bg-gray-700': darkMode}"
            @click="toggleSidebar"
            :title="sidebarCollapsed ? 'Expand menu' : 'Collapse menu'">
            <span class="i-mdi-menu w-6 h-6" :class="{'text-gray-700': !darkMode, 'text-white': darkMode}"></span>
          </button>
          <h1 class="text-xl lg:text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            {{ $t('title') }}
          </h1>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2">
          <!-- Dark Mode Toggle -->
          <button
            class="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            :class="{'hover:bg-gray-100': !darkMode, 'hover:bg-gray-700': darkMode}"
            @click="toggleDarkMode"
            :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'">
            <span v-if="!darkMode" class="i-mdi-weather-sunny w-5 h-5 text-yellow-500"></span>
            <span v-else class="i-mdi-weather-night w-5 h-5 text-blue-400"></span>
          </button>

          <!-- User Info -->
          <div v-if="user" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg"
               :class="{'bg-gray-100': !darkMode, 'bg-gray-700': darkMode}">
            <span class="i-mdi-account-circle w-5 h-5" :class="{'text-gray-700': !darkMode, 'text-gray-300': darkMode}"></span>
            <span class="text-sm font-medium" :class="{'text-gray-700': !darkMode, 'text-gray-200': darkMode}">
              {{ user.username }}
            </span>
          </div>

          <!-- Logout Button -->
          <button
            v-if="user"
            class="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            :class="{'hover:bg-red-50 text-red-600': !darkMode, 'hover:bg-red-900/30 text-red-400': darkMode}"
            @click="logout"
            title="Logout">
            <span class="i-mdi-logout w-5 h-5"></span>
          </button>

          <!-- Language Selector -->
          <div class="relative">
            <button
              class="p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-1"
              :class="{'hover:bg-gray-100': !darkMode, 'hover:bg-gray-700': darkMode}"
              @click="toggleLanguageMenu">
              <span class="i-mdi-translate w-5 h-5" :class="{'text-gray-700': !darkMode, 'text-white': darkMode}"></span>
              <span class="hidden sm:inline text-sm font-medium" :class="{'text-gray-700': !darkMode, 'text-gray-200': darkMode}">
                {{ currentLocaleName }}
              </span>
              <span class="i-mdi-chevron-down w-4 h-4" :class="{'text-gray-700': !darkMode, 'text-white': darkMode}"></span>
            </button>
            <transition name="dropdown">
              <div v-if="languageMenuOpen"
                   class="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border overflow-hidden z-50 backdrop-blur-md"
                   :class="{'bg-white/95 border-gray-200': !darkMode, 'bg-gray-800/95 border-gray-700': darkMode}">
                <div v-for="locale in locales"
                     :key="locale.code"
                     class="px-4 py-2.5 cursor-pointer transition-colors duration-150 flex items-center gap-2"
                     :class="{'hover:bg-gray-100': !darkMode, 'hover:bg-gray-700': darkMode}">
                  <span class="i-mdi-check w-4 h-4 text-teal-500" v-if="locale.code === $i18n.locale"></span>
                  <span class="w-4" v-else></span>
                  <a class="block flex-1" href="#" @click.prevent="setLocale(locale.code); languageMenuOpen = false">
                    {{ locale.name }}
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <div class="flex flex-row flex-grow overflow-hidden">
      <!-- Mobile Overlay -->
      <transition name="overlay">
        <div v-if="mobileMenuOpen"
             class="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
             @click="closeMobileMenu"></div>
      </transition>

      <!-- Sidebar Navigation -->
      <transition name="slide">
        <aside
          v-show="!sidebarCollapsed || mobileMenuOpen"
          class="fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-30 lg:z-10 transition-all duration-300 border-r overflow-y-auto"
          :class="[
            sidebarCollapsed && !mobileMenuOpen ? 'lg:w-20' : 'w-64 lg:w-64',
            {'bg-white border-gray-200': !darkMode, 'bg-gray-800 border-gray-700': darkMode}
          ]">
          <nav class="p-4">
            <ul class="space-y-1.5">
              <li v-for="item in menuItems" :key="item.to">
                <template v-if="!item.children">
                  <NuxtLink
                    :to="item.to"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
                    :class="[
                      $route.path.startsWith(item.to)
                        ? (darkMode ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/50' : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30')
                        : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'),
                    ]"
                    @click="closeMobileMenu">
                    <span :class="[item.icon, 'w-5 h-5 shrink-0']"></span>
                    <span v-show="!sidebarCollapsed || mobileMenuOpen" class="font-medium">
                      {{ $t(item.label) }}
                    </span>
                  </NuxtLink>
                </template>

                <template v-else>
                  <div>
                    <button
                      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                      :class="{'hover:bg-gray-100 text-gray-700': !darkMode, 'hover:bg-gray-700 text-gray-300': darkMode}"
                      @click="toggleSubmenu(item.to)">
                      <span :class="[item.icon, 'w-5 h-5 shrink-0']"></span>
                      <span v-show="!sidebarCollapsed || mobileMenuOpen" class="font-medium flex-1 text-left">
                        {{ $t(item.label) }}
                      </span>
                      <span v-show="!sidebarCollapsed || mobileMenuOpen"
                            :class="['i-mdi-chevron-down w-4 h-4 transition-transform duration-200', isSubmenuOpen(item.to) ? 'rotate-180' : '']"></span>
                    </button>
                    <transition name="submenu">
                      <ul v-show="isSubmenuOpen(item.to) && (!sidebarCollapsed || mobileMenuOpen)" class="ml-8 mt-1 space-y-1">
                        <li v-for="child in item.children" :key="child.to">
                          <NuxtLink
                            :to="child.to"
                            class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                            :class="[
                              $route.path === child.to || $route.path.startsWith(child.to + '/')
                                ? (darkMode ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white')
                                : (darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'),
                            ]"
                            @click="closeMobileMenu">
                            <span :class="[child.icon, 'w-4 h-4']"></span>
                            <span class="font-medium">{{ $t(child.label) }}</span>
                          </NuxtLink>
                        </li>
                      </ul>
                    </transition>
                  </div>
                </template>
              </li>
            </ul>
          </nav>
        </aside>
      </transition>

      <!-- Main Content -->
      <main class="flex-grow overflow-auto">
        <div class="container mx-auto p-4 lg:p-6">
          <slot />
        </div>
      </main>
    </div>

    <!-- Modern Footer -->
    <footer class="border-t py-4 px-6 text-center text-sm transition-colors duration-300"
            :class="{'bg-white border-gray-200 text-gray-600': !darkMode, 'bg-gray-800 border-gray-700 text-gray-400': darkMode}">
      <p>{{ $t('footer.copyright', { year: currentYear }) }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

const { locale, locales, setLocale } = useI18n()
const currentYear = new Date().getFullYear()
const mobileMenuOpen = ref(false)
const darkMode = ref(false)
const languageMenuOpen = ref(false)
const sidebarCollapsed = ref(false)
const openSubmenus = ref({
  '/settings': true,
  '/restaurant': true
})
const user = ref(null)
const router = useRouter()
const route = useRoute()

// Menu items configuration
const menuItems = [
  {
    to: '/projekte',
    icon: 'i-mdi-folder-multiple',
    label: 'menu.projects'
  },
  {
    to: '/standorte',
    icon: 'i-mdi-map-marker',
    label: 'menu.locations'
  },
  {
    to: '/produkte',
    icon: 'i-mdi-package',
    label: 'menu.products'
  },
  {
    to: '/kunden',
    icon: 'i-mdi-account-group',
    label: 'menu.customers'
  },
  {
    to: '/rechnungen',
    icon: 'i-mdi-receipt',
    label: 'menu.invoices'
  },
  {
    to: '/lieferanten',
    icon: 'i-mdi-truck',
    label: 'menu.suppliers'
  },
  {
    to: '/kassen',
    icon: 'i-mdi-cash-register',
    label: 'menu.cashRegister'
  },
  {
    to: '/restaurant',
    icon: 'i-mdi-silverware-fork-knife',
    label: 'restaurant.title',
    children: [
      {
        to: '/restaurant/tische',
        icon: 'i-mdi-table-furniture',
        label: 'restaurant.tables.title'
      },
      {
        to: '/restaurant/reservierungen',
        icon: 'i-mdi-calendar-check',
        label: 'restaurant.reservations.title'
      }
    ]
  },
  {
    to: '/berichte',
    icon: 'i-mdi-chart-bar',
    label: 'menu.reports'
  },
  {
    to: '/settings',
    icon: 'i-mdi-cog',
    label: 'menu.settings',
    children: [
      {
        to: '/umsatzsteuersaetze',
        icon: 'i-mdi-currency-eur',
        label: 'menu.vat'
      },
      {
        to: '/einheiten',
        icon: 'i-mdi-ruler',
        label: 'menu.unit'
      }
    ]
  }
]

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value)
  return current ? current.name : 'Language'
})

function toggleSidebar() {
  if (window.innerWidth < 1024) {
    // Mobile: toggle mobile menu
    mobileMenuOpen.value = !mobileMenuOpen.value
  } else {
    // Desktop: toggle collapse
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
  }
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

function toggleSubmenu(path) {
  openSubmenus.value[path] = !openSubmenus.value[path]
}

function isSubmenuOpen(path) {
  return openSubmenus.value[path] !== undefined ? openSubmenus.value[path] : false
}

async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      user.value = null
      router.push('/login')
    }
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

onMounted(() => {
  if (process.client) {
    // Restore dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      darkMode.value = savedDarkMode === 'true'
    } else {
      darkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      localStorage.setItem('darkMode', darkMode.value.toString())
    }

    // Restore sidebar collapsed state
    const savedSidebarState = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarState) {
      sidebarCollapsed.value = savedSidebarState === 'true'
    }

    // Check for auth-session cookie
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-session='))
    if (authCookie) {
      try {
        const sessionData = decodeURIComponent(authCookie.split('=')[1])
        user.value = JSON.parse(sessionData)
      } catch (error) {
        console.error('Failed to parse auth session:', error)
      }
    }
  }
})
</script>

<style scoped>
/* Smooth scrollbar for sidebar */
aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Slide Animation for Sidebar */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Overlay Animation */
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Submenu Animation */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease-out;
  max-height: 200px;
  overflow: hidden;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Active link glow effect */
.router-link-active {
  position: relative;
}

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
  color: currentColor;
}

/* Smooth transitions for all interactive elements */
button,
a {
  transition: all 0.2s ease-in-out;
}

/* Glass morphism effect support */
.backdrop-blur-md {
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

/* Gradient text support for older browsers */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}
</style>
