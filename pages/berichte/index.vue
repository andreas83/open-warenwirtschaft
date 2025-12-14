<template>
  <div class="container mx-auto py-6 px-4">
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">{{ $t('berichte.title') }}</h1>
      <p class="text-gray-600">{{ $t('berichte.subtitle') }}</p>
    </div>

    <!-- Report Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Sales Report Card -->
      <NuxtLink to="/berichte/verkauf" class="group">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">{{ $t('berichte.verkauf.title') }}</h3>
          <p class="text-blue-100 text-sm">{{ $t('berichte.verkauf.description') }}</p>
        </div>
      </NuxtLink>

      <!-- Inventory Report Card -->
      <NuxtLink to="/berichte/lagerbestand" class="group">
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">{{ $t('berichte.lagerbestand.title') }}</h3>
          <p class="text-green-100 text-sm">{{ $t('berichte.lagerbestand.description') }}</p>
        </div>
      </NuxtLink>

      <!-- Customer Analytics Card -->
      <NuxtLink to="/berichte/kunden" class="group">
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">{{ $t('berichte.kunden.title') }}</h3>
          <p class="text-indigo-100 text-sm">{{ $t('berichte.kunden.description') }}</p>
        </div>
      </NuxtLink>

      <!-- Product Performance Card -->
      <NuxtLink to="/berichte/produkte" class="group">
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">{{ $t('berichte.produkte.title') }}</h3>
          <p class="text-orange-100 text-sm">{{ $t('berichte.produkte.description') }}</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Quick Stats Overview -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ $t('berichte.quickStats') }}</h2>
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">{{ $t('berichte.loading') }}</p>
      </div>
      <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Revenue -->
        <div class="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-600 font-semibold mb-1">{{ $t('berichte.totalRevenue') }}</p>
              <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.totalRevenue) }}</p>
            </div>
            <div class="bg-blue-500 rounded-full p-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Customers -->
        <div class="bg-indigo-50 rounded-lg p-5 border-l-4 border-indigo-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-indigo-600 font-semibold mb-1">{{ $t('berichte.totalCustomers') }}</p>
              <p class="text-2xl font-bold text-gray-800">{{ stats.totalCustomers }}</p>
            </div>
            <div class="bg-indigo-500 rounded-full p-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Products -->
        <div class="bg-orange-50 rounded-lg p-5 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-orange-600 font-semibold mb-1">{{ $t('berichte.totalProducts') }}</p>
              <p class="text-2xl font-bold text-gray-800">{{ stats.totalProducts }}</p>
            </div>
            <div class="bg-orange-500 rounded-full p-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Inventory Value -->
        <div class="bg-green-50 rounded-lg p-5 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-600 font-semibold mb-1">{{ $t('berichte.inventoryValue') }}</p>
              <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.inventoryValue) }}</p>
            </div>
            <div class="bg-green-500 rounded-full p-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(true)
const error = ref(null)
const stats = ref({
  totalRevenue: 0,
  totalCustomers: 0,
  totalProducts: 0,
  inventoryValue: 0
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const fetchQuickStats = async () => {
  try {
    loading.value = true

    // Get last year's data for quick stats
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]

    const [salesData, customerData, productData, inventoryData] = await Promise.all([
      $fetch(`/api/berichte/verkauf?startDate=${startDate}&endDate=${endDate}`),
      $fetch(`/api/berichte/kunden?startDate=${startDate}&endDate=${endDate}`),
      $fetch(`/api/berichte/produkte?startDate=${startDate}&endDate=${endDate}`),
      $fetch('/api/berichte/lagerbestand')
    ])

    stats.value = {
      totalRevenue: salesData?.kpis?.totalRevenue || 0,
      totalCustomers: customerData?.kpis?.totalCustomers || 0,
      totalProducts: productData?.kpis?.totalProducts || 0,
      inventoryValue: inventoryData?.kpis?.totalInventoryValue || 0
    }
  } catch (err) {
    console.error('Error fetching quick stats:', err)
    error.value = t('berichte.errorLoading')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchQuickStats()
})
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
