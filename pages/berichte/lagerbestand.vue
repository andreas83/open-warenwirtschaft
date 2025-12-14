<template>
  <div class="container mx-auto py-6 px-4">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <NuxtLink to="/berichte" class="text-blue-600 hover:text-blue-800 flex items-center mb-2">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          {{ $t('berichte.backToReports') }}
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('berichte.lagerbestand.title') }}</h1>
        <p class="text-gray-600">{{ $t('berichte.lagerbestand.subtitle') }}</p>
      </div>
      <button @click="exportData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        {{ $t('berichte.export') }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      <p class="mt-4 text-gray-600">{{ $t('berichte.loading') }}</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-20">{{ error }}</div>
    <div v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.lagerbestand.totalProducts') }}</p>
          <p class="text-2xl font-bold text-green-600">{{ data.kpis.totalProducts }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.lagerbestand.inventoryValue') }}</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(data.kpis.totalInventoryValue) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.lagerbestand.lowStock') }}</p>
          <p class="text-2xl font-bold text-orange-600">{{ data.kpis.lowStockCount }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.lagerbestand.expiring') }}</p>
          <p class="text-2xl font-bold text-red-600">{{ data.kpis.expiringCount }}</p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Status Distribution -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.lagerbestand.statusDistribution') }}</h3>
          <ClientOnly>
            <div ref="statusChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>

        <!-- Stock by Location -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.lagerbestand.stockByLocation') }}</h3>
          <ClientOnly>
            <div ref="locationChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>

        <!-- Movement Types -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.lagerbestand.movementTypes') }}</h3>
          <ClientOnly>
            <div ref="movementChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>

        <!-- Top Products by Quantity -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.lagerbestand.topProducts') }}</h3>
          <ClientOnly>
            <div ref="topProductsChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div v-if="data.lowStockProducts.length > 0" class="bg-orange-50 border-l-4 border-orange-500 rounded-lg shadow-md p-5 mb-6">
        <h3 class="text-lg font-semibold text-orange-800 mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          {{ $t('berichte.lagerbestand.lowStockWarning') }}
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-orange-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase">{{ $t('berichte.lagerbestand.product') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase">{{ $t('berichte.lagerbestand.location') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase">{{ $t('berichte.lagerbestand.currentStock') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-orange-800 uppercase">{{ $t('berichte.lagerbestand.reorderLevel') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-orange-200">
              <tr v-for="product in data.lowStockProducts.slice(0, 10)" :key="product.produktId" class="hover:bg-orange-100">
                <td class="px-4 py-3 text-sm text-gray-900">{{ product.produktName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ product.standort }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-orange-700">{{ product.menge }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ product.meldebestand }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Expiring Products -->
      <div v-if="data.expiringProducts.length > 0" class="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md p-5 mb-6">
        <h3 class="text-lg font-semibold text-red-800 mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ $t('berichte.lagerbestand.expiringProducts') }}
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-red-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">{{ $t('berichte.lagerbestand.product') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">{{ $t('berichte.lagerbestand.batch') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">{{ $t('berichte.lagerbestand.expiryDate') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">{{ $t('berichte.lagerbestand.quantity') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">{{ $t('berichte.lagerbestand.location') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-red-200">
              <tr v-for="product in data.expiringProducts" :key="`${product.produktId}-${product.chargennummer}`" class="hover:bg-red-100">
                <td class="px-4 py-3 text-sm text-gray-900">{{ product.produktName }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ product.chargennummer }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-red-700">{{ formatDate(product.ablaufdatum) }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ product.menge }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ product.standort }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Movements -->
      <div class="bg-white rounded-lg shadow-md p-5">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.lagerbestand.recentMovements') }}</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.lagerbestand.date') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.lagerbestand.type') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.lagerbestand.product') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.lagerbestand.quantity') }}</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.lagerbestand.user') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="movement in data.recentMovements" :key="movement.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(movement.datum) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span :class="getMovementTypeClass(movement.typ)">{{ movement.typ }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ movement.produkt }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ movement.menge }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ movement.benutzer }}</td>
              </tr>
            </tbody>
          </table>
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
const data = ref({
  kpis: {
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
    expiringCount: 0
  },
  statusDistribution: {},
  lowStockProducts: [],
  stockByLocation: [],
  topProductsByQuantity: [],
  recentMovements: [],
  movementTypes: [],
  expiringProducts: []
})

const statusChart = ref(null)
const locationChart = ref(null)
const movementChart = ref(null)
const topProductsChart = ref(null)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('de-DE')
}

const getMovementTypeClass = (type) => {
  const classes = {
    'Wareneingang': 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    'Warenausgang': 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
    'Umlagerung': 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
    'Inventurkorrektur': 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
    'Retoure': 'px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800',
    'Schwund': 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
  }
  return classes[type] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
}

const fetchData = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/berichte/lagerbestand')
    data.value = response
    await nextTick()
    initializeCharts()
  } catch (err) {
    console.error('Error fetching inventory data:', err)
    error.value = t('berichte.errorLoading')
  } finally {
    loading.value = false
  }
}

const initializeCharts = () => {
  if (typeof window === 'undefined') return

  // Status Distribution Pie Chart
  if (statusChart.value) {
    const chart1 = echarts.init(statusChart.value)
    chart1.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: Object.entries(data.value.statusDistribution).map(([name, value]) => ({ name, value })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    })
  }

  // Stock by Location Bar Chart
  if (locationChart.value) {
    const chart2 = echarts.init(locationChart.value)
    chart2.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: data.value.stockByLocation.map(item => item.location)
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value} €' }
      },
      series: [{
        data: data.value.stockByLocation.map(item => item.value),
        type: 'bar',
        itemStyle: { color: '#10B981' }
      }]
    })
  }

  // Movement Types Pie Chart
  if (movementChart.value) {
    const chart3 = echarts.init(movementChart.value)
    chart3.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center' },
      series: [{
        type: 'pie',
        radius: '60%',
        data: data.value.movementTypes.map(item => ({ name: item.type, value: item.count })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    })
  }

  // Top Products by Quantity
  if (topProductsChart.value) {
    const chart4 = echarts.init(topProductsChart.value)
    chart4.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: data.value.topProductsByQuantity.map(item => item.produktName).slice(0, 10).reverse()
      },
      series: [{
        data: data.value.topProductsByQuantity.map(item => item.menge).slice(0, 10).reverse(),
        type: 'bar',
        itemStyle: { color: '#F59E0B' }
      }]
    })
  }
}

const exportData = () => {
  const headers = ['Produkt', 'Standort', 'Menge', 'Wert']
  const rows = data.value.topProductsByQuantity.map(item => [
    item.produktName,
    '-',
    item.menge,
    item.wert.toFixed(2)
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `lagerbestand_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchData()
})
</script>
