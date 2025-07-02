import { ModuleOptions } from '@nuxtjs/i18n';

declare module '@nuxt/schema' {
  interface NuxtConfig {
    i18n?: ModuleOptions;
  }
}
