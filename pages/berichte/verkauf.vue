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
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('berichte.verkauf.title') }}</h1>
        <p class="text-gray-600">{{ $t('berichte.verkauf.subtitle') }}</p>
      </div>
      <button @click="exportData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        {{ $t('berichte.export') }}
      </button>
    </div>

    <!-- Date Range Filter -->
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
          <button @click="setQuickRange('lastMonth')" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
            {{ $t('berichte.lastMonth') }}
          </button>
          <button @click="setQuickRange('lastYear')" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
            {{ $t('berichte.lastYear') }}
          </button>
          <button @click="fetchData" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            {{ $t('berichte.apply') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">{{ $t('berichte.loading') }}</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-20">{{ error }}</div>
    <div v-else>
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.verkauf.totalRevenue') }}</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(data.kpis.totalRevenue) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.verkauf.totalRevenueNetto') }}</p>
          <p class="text-2xl font-bold text-green-600">{{ formatCurrency(data.kpis.totalRevenueNetto) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.verkauf.totalInvoices') }}</p>
          <p class="text-2xl font-bold text-indigo-600">{{ data.kpis.totalInvoices }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.verkauf.averageInvoice') }}</p>
          <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(data.kpis.averageInvoiceValue) }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.verkauf.totalTax') }}</p>
          <p class="text-2xl font-bold text-gray-600">{{ formatCurrency(data.kpis.totalTax) }}</p>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Revenue Over Time -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.verkauf.revenueOverTime') }}</h3>
          <ClientOnly>
            <div ref="revenueChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>

        <!-- Revenue by Status -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.verkauf.revenueByStatus') }}</h3>
          <ClientOnly>
            <div ref="statusChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>

        <!-- Status Distribution -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.verkauf.statusDistribution') }}</h3>
          <ClientOnly>
            <div ref="statusDistChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>

        <!-- Revenue by Day of Week -->
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.verkauf.revenueByDay') }}</h3>
          <ClientOnly>
            <div ref="dayChart" style="height: 350px;"></div>
          </ClientOnly>
        </div>
      </div>

      <!-- Top Products Table -->
      <div class="bg-white rounded-lg shadow-md p-5">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.verkauf.topProducts') }}</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('berichte.verkauf.product') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('berichte.verkauf.quantity') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('berichte.verkauf.revenue') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(product, index) in data.topProducts" :key="product.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ product.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.quantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(product.revenue) }}</td>
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
    totalRevenue: 0,
    totalRevenueNetto: 0,
    totalInvoices: 0,
    averageInvoiceValue: 0,
    totalTax: 0
  },
  revenueByMonth: [],
  revenueByStatus: [],
  statusDistribution: {},
  revenueByDayOfWeek: [],
  topProducts: []
})

const startDate = ref('')
const endDate = ref('')

const revenueChart = ref(null)
const statusChart = ref(null)
const statusDistChart = ref(null)
const dayChart = ref(null)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

const setQuickRange = (range) => {
  const today = new Date()
  if (range === 'lastMonth') {
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    startDate.value = lastMonth.toISOString().split('T')[0]
    endDate.value = today.toISOString().split('T')[0]
  } else if (range === 'lastYear') {
    const lastYear = new Date(today)
    lastYear.setFullYear(lastYear.getFullYear() - 1)
    startDate.value = lastYear.toISOString().split('T')[0]
    endDate.value = today.toISOString().split('T')[0]
  }
  fetchData()
}

const fetchData = async () => {
  try {
    loading.value = true
    const url = `/api/berichte/verkauf?startDate=${startDate.value}&endDate=${endDate.value}`
    const response = await $fetch(url)
    data.value = response
    await nextTick()
    initializeCharts()
  } catch (err) {
    console.error('Error fetching sales data:', err)
    error.value = t('berichte.errorLoading')
  } finally {
    loading.value = false
  }
}

const initializeCharts = () => {
  if (typeof window === 'undefined') return

  // Revenue Over Time Chart
  if (revenueChart.value) {
    const chart1 = echarts.init(revenueChart.value)
    chart1.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.value.revenueByMonth.map(item => item.month)
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value} €' }
      },
      series: [{
        data: data.value.revenueByMonth.map(item => item.revenue),
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#3B82F6' }
      }]
    })
  }

  // Revenue by Status Chart
  if (statusChart.value) {
    const chart2 = echarts.init(statusChart.value)
    chart2.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: data.value.revenueByStatus.map(item => item.status)
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value} €' }
      },
      series: [{
        data: data.value.revenueByStatus.map(item => item.revenue),
        type: 'bar',
        itemStyle: { color: '#10B981' }
      }]
    })
  }

  // Status Distribution Pie Chart
  if (statusDistChart.value) {
    const chart3 = echarts.init(statusDistChart.value)
    chart3.setOption({
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

  // Revenue by Day of Week Chart
  if (dayChart.value) {
    const chart4 = echarts.init(dayChart.value)
    const dayOrder = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
    const sortedData = dayOrder.map(day => {
      const found = data.value.revenueByDayOfWeek.find(item => item.day === day)
      return found ? found.revenue : 0
    })
    chart4.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: dayOrder
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value} €' }
      },
      series: [{
        data: sortedData,
        type: 'bar',
        itemStyle: { color: '#F59E0B' }
      }]
    })
  }
}

const exportData = () => {
  // Create CSV content
  const headers = ['Monat', 'Umsatz', 'Anzahl Rechnungen']
  const rows = data.value.revenueByMonth.map(item => [
    item.month,
    item.revenue.toFixed(2),
    item.count
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `verkaufsbericht_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  setQuickRange('lastYear')
})
</script>
