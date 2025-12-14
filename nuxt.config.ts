// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: ["@unocss/nuxt", "@nuxtjs/i18n", "nuxt-auth-utils"],

  i18n: {
    locales: [
      { code: 'de', name: 'Deutsch', file: 'de.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'de',
    strategy: 'no_prefix',
    bundle: {
      optimizeTranslationDirective: false
    }
  },

  unocss: {
    uno: true,
    preflight: true,
    icons: true,
    presets: [
      async () => (await import('@unocss/preset-wind')).default({
        dark: 'media'
      }),
      async () => (await import('@unocss/preset-icons')).default({
        scale: 1.2,
        warn: true,
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        }
      })
    ],
    safelist: [
      'i-mdi-briefcase', 'i-mdi-map-marker', 'i-mdi-cube', 'i-mdi-shape',
      'i-mdi-account-group', 'i-mdi-account-multiple', 'i-mdi-file-document',
      'i-mdi-clipboard-list', 'i-mdi-truck', 'i-mdi-cash-register',
      'i-mdi-warehouse', 'i-mdi-package-variant', 'i-mdi-swap-horizontal',
      'i-mdi-finance', 'i-mdi-credit-card', 'i-mdi-percent', 'i-mdi-undo-variant',
      'i-mdi-domain', 'i-mdi-file-document-edit', 'i-mdi-file-sign',
      'i-mdi-account-tie', 'i-mdi-credit-card-check', 'i-mdi-truck-delivery',
      'i-mdi-silverware-fork-knife', 'i-mdi-table-furniture', 'i-mdi-calendar-clock',
      'i-mdi-food', 'i-mdi-bed', 'i-mdi-door', 'i-mdi-star', 'i-mdi-calendar-check',
      'i-mdi-store', 'i-mdi-cart', 'i-mdi-tag-multiple', 'i-mdi-shopping',
      'i-mdi-chart-bar', 'i-mdi-cog', 'i-mdi-ruler',
      'i-mdi-plus', 'i-mdi-minus', 'i-mdi-close', 'i-mdi-check', 'i-mdi-pencil',
      'i-mdi-delete', 'i-mdi-eye', 'i-mdi-chevron-down', 'i-mdi-chevron-up',
      'i-mdi-chevron-left', 'i-mdi-chevron-right', 'i-mdi-menu', 'i-mdi-magnify',
      'i-mdi-refresh', 'i-mdi-download', 'i-mdi-upload', 'i-mdi-printer',
      'i-mdi-home', 'i-mdi-logout', 'i-mdi-login', 'i-mdi-account',
      'i-mdi-account-circle', 'i-mdi-bell', 'i-mdi-calendar', 'i-mdi-clock',
      'i-mdi-alert', 'i-mdi-loading', 'i-mdi-arrow-left', 'i-mdi-arrow-right',
      'i-mdi-image', 'i-mdi-folder-multiple', 'i-mdi-close-circle',
      'i-mdi-weather-sunny', 'i-mdi-weather-night', 'i-mdi-translate',
    ],
    theme: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b'
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03'
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        }
      }
    },
    shortcuts: {
      'btn': 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      'btn-primary': 'btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
      'btn-secondary': 'btn bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50 focus:ring-primary-500 shadow-sm',
      'btn-success': 'btn bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm',
      'btn-danger': 'btn bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm',
      'btn-warning': 'btn bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-sm',
      'btn-ghost': 'btn text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
      'btn-xs': 'px-2 py-1 text-xs',
      'btn-sm': 'px-3 py-1.5 text-sm',
      'btn-md': 'px-4 py-2 text-sm',
      'btn-lg': 'px-5 py-2.5 text-base',
      'btn-xl': 'px-6 py-3 text-lg',
      'card': 'bg-white dark:bg-secondary-800 rounded-lg shadow-md',
      'card-header': 'px-6 py-4 border-b border-secondary-200 dark:border-secondary-700',
      'card-body': 'p-6',
      'card-footer': 'px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900 rounded-b-lg',
      'input': 'w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
      'badge': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      'badge-primary': 'badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      'badge-success': 'badge bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
      'badge-warning': 'badge bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
      'badge-danger': 'badge bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
      'badge-info': 'badge bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200'
    }
  },
})
