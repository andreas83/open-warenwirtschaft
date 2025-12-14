<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-2xl mx-auto px-4 py-16 text-center">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div class="i-mdi-check-circle text-5xl text-green-600"></div>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{ $t('storefront.orderSuccess') }}
        </h1>

        <p class="text-gray-600 mb-6">
          {{ $t('storefront.orderSuccessMessage') }}
        </p>

        <div v-if="orderId" class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600 mb-1">{{ $t('storefront.orderNumber') }}</p>
          <p class="text-2xl font-bold text-primary-600">#{{ orderId }}</p>
        </div>

        <div class="space-y-4">
          <p class="text-gray-700">
            {{ $t('storefront.confirmationEmailSent') }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <NuxtLink to="/storefront" class="btn-primary">
              {{ $t('storefront.backToHome') }}
            </NuxtLink>
            <NuxtLink to="/storefront/products" class="btn-secondary">
              {{ $t('storefront.continueShopping') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const orderId = computed(() => route.query.orderId)
</script>
