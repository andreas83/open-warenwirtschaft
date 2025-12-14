<template>
  <div class="p-6">
    <div class="bg-white rounded-lg shadow-md p-8 text-center max-w-xl mx-auto">
      <div class="i-mdi-information-outline w-16 h-16 mx-auto text-blue-500 mb-4"></div>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ $t('shop.products.title') }}</h1>
      <p class="text-gray-600 mb-6">
        Die Shop-Produkte wurden in die zentrale Produktverwaltung integriert.
        Bitte nutzen Sie die Hauptproduktseite um Produkte zu verwalten.
      </p>
      <NuxtLink
        to="/produkte"
        class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-200"
      >
        <span class="i-mdi-package w-5 h-5"></span>
        Zur Produktverwaltung
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// Redirect to main products page
onMounted(() => {
  // Auto-redirect after a brief delay
  setTimeout(() => {
    navigateTo('/produkte')
  }, 3000)
})
</script>
