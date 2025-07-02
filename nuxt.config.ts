// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: ["@unocss/nuxt", "@nuxtjs/i18n"],
 
  i18n: {
    vueI18n: '/home/andreas/dev/macrogroup/i18n/index.js',
    locales: [
      { code: 'de', name: 'Deutsch' },
      { code: 'en', name: 'English' }
    ],
    defaultLocale: 'de',
    strategy: 'no_prefix'
  },
  unocss: {
    uno: true,
    preflight: true,
    presets: [
      // Using dynamic imports for compatibility with ES modules
      async () => (await import('@unocss/preset-wind')).default(
        {
           dark: 'media'
        }
      ),
      async () => (await import('@unocss/preset-icons')).default({
        scale: 1.2,
        warn: true
      })
    ]
  }
})
