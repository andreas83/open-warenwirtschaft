<template>
  <div class="container mx-auto py-6 px-4">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <NuxtLink to="/berichte" class="text-blue-600 hover:text-blue-800 flex items-center mb-2">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {{ $t('berichte.backToReports') }}
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('berichte.produkte.title') }}</h1>
        <p class="text-gray-600">{{ $t('berichte.produkte.subtitle') }}</p>
      </div>
      <button @click="exportData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        {{ $t('berichte.export') }}
      </button>
    </div>

    <div class="mb-6 bg-white p-4 rounded-lg shadow-md">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('berichte.dateRange') }}</label>
          <div class="flex gap-2">
            <input v-model="startDate" type="date" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span class="self-center">-</span>
            <input v-model="endDate" type="date" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="setQuickRange('lastMonth')" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">{{ $t('berichte.lastMonth') }}</button>
          <button @click="setQuickRange('lastYear')" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">{{ $t('berichte.lastYear') }}</button>
          <button @click="fetchData" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">{{ $t('berichte.apply') }}</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      <p class="mt-4 text-gray-600">{{ $t('berichte.loading') }}</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-20">{{ error }}</div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.produkte.totalProducts') }}</p>
          <p class="text-2xl font-bold text-orange-600">{{ data.kpis.totalProducts }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.produkte.withSales') }}</p>
          <p class="text-2xl font-bold text-green-600">{{ data.kpis.productsWithSales }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.produkte.totalRevenue') }}</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(data.kpis.totalRevenue) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.produkte.stockValue') }}</p>
          <p class="text-2xl font-bold text-indigo-600">{{ formatCurrency(data.kpis.totalStockValue) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.produkte.avgPrice') }}</p>
          <p class="text-2xl font-bold text-gray-600">{{ formatCurrency(data.kpis.averagePrice) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.produkte.salesTrend') }}</h3>
          <ClientOnly><div ref="salesTrendChart" style="height: 350px;"></div></ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.produkte.categoryRevenue') }}</h3>
          <ClientOnly><div ref="categoryChart" style="height: 350px;"></div></ClientOnly>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.produkte.topByRevenue') }}</h3>
          <div class="space-y-3">
            <div v-for="(product, index) in data.topProductsByRevenue.slice(0, 10)" :key="product.produktId" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <span class="text-sm font-bold text-gray-500 mr-3">{{ index + 1 }}</span>
                <span class="text-sm text-gray-900">{{ product.name }}</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ formatCurrency(product.totalRevenue) }}</span>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.produkte.topByQuantity') }}</h3>
          <div class="space-y-3">
            <div v-for="(product, index) in data.topProductsByQuantity.slice(0, 10)" :key="product.produktId" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <span class="text-sm font-bold text-gray-500 mr-3">{{ index + 1 }}</span>
                <span class="text-sm text-gray-900">{{ product.name }}</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ product.totalQuantitySold }} {{ product.einheit }}</span>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.produkte.slowMovers') }}</h3>
          <div class="space-y-3">
            <div v-for="(product, index) in data.slowMovers.slice(0, 10)" :key="product.produktId" class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div class="flex items-center">
                <span class="text-sm font-bold text-orange-500 mr-3">{{ index + 1 }}</span>
                <span class="text-sm text-gray-900">{{ product.name }}</span>
              </div>
              <span class="text-sm font-semibold text-orange-600">{{ formatCurrency(product.stockValue) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'

const { t } = useI18n()
const loading = ref(true)
const error = ref(null)
const data = ref({ kpis: {}, topProductsByRevenue: [], topProductsByQuantity: [], slowMovers: [], revenueByCategory: [], salesByMonth: [] })
const startDate = ref('')
const endDate = ref('')
const salesTrendChart = ref(null)
const categoryChart = ref(null)

const formatCurrency = (value) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)

const setQuickRange = (range) => {
  const today = new Date()
  if (range === 'lastMonth') {
    const lastMonth = new Date(today); lastMonth.setMonth(lastMonth.getMonth() - 1)
    startDate.value = lastMonth.toISOString().split('T')[0]
    endDate.value = today.toISOString().split('T')[0]
  } else if (range === 'lastYear') {
    const lastYear = new Date(today); lastYear.setFullYear(lastYear.getFullYear() - 1)
    startDate.value = lastYear.toISOString().split('T')[0]
    endDate.value = today.toISOString().split('T')[0]
  }
  fetchData()
}

const fetchData = async () => {
  try {
    loading.value = true
    const response = await $fetch(`/api/berichte/produkte?startDate=${startDate.value}&endDate=${endDate.value}`)
    data.value = response
    await nextTick()
    initializeCharts()
  } catch (err) {
    error.value = t('berichte.errorLoading')
  } finally {
    loading.value = false
  }
}

const initializeCharts = () => {
  if (typeof window === 'undefined') return
  if (salesTrendChart.value) {
    const chart1 = echarts.init(salesTrendChart.value)
    chart1.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.value.salesByMonth.map(item => item.month) },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} €' } },
      series: [{ data: data.value.salesByMonth.map(item => item.revenue), type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#F59E0B' } }]
    })
  }
  if (categoryChart.value) {
    const chart2 = echarts.init(categoryChart.value)
    chart2.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center' },
      series: [{ type: 'pie', radius: ['40%', '70%'], data: data.value.revenueByCategory.map(item => ({ name: item.category, value: item.revenue })) }]
    })
  }
}

const exportData = () => {
  const headers = ['Produkt', 'Kategorie', 'Verkaufte Menge', 'Umsatz']
  const rows = data.value.topProductsByRevenue.map(p => [p.name, p.kategorie, p.totalQuantitySold, p.totalRevenue.toFixed(2)])
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `produktbericht_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

onMounted(() => { setQuickRange('lastYear') })
</script>
