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
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('berichte.kunden.title') }}</h1>
        <p class="text-gray-600">{{ $t('berichte.kunden.subtitle') }}</p>
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
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p class="mt-4 text-gray-600">{{ $t('berichte.loading') }}</p>
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-20">{{ error }}</div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.kunden.totalCustomers') }}</p>
          <p class="text-2xl font-bold text-purple-600">{{ data.kpis.totalCustomers }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.kunden.activeCustomers') }}</p>
          <p class="text-2xl font-bold text-green-600">{{ data.kpis.activeCustomers }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.kunden.churning') }}</p>
          <p class="text-2xl font-bold text-orange-600">{{ data.kpis.churningCustomers }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.kunden.lost') }}</p>
          <p class="text-2xl font-bold text-red-600">{{ data.kpis.lostCustomers }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <p class="text-sm text-gray-600 mb-1">{{ $t('berichte.kunden.avgValue') }}</p>
          <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(data.kpis.averageCustomerValue) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.kunden.statusDist') }}</h3>
          <ClientOnly><div ref="statusChart" style="height: 350px;"></div></ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.kunden.groupDist') }}</h3>
          <ClientOnly><div ref="groupChart" style="height: 350px;"></div></ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.kunden.acquisitionTrend') }}</h3>
          <ClientOnly><div ref="acquisitionChart" style="height: 350px;"></div></ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.kunden.geography') }}</h3>
          <ClientOnly><div ref="geoChart" style="height: 350px;"></div></ClientOnly>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-5">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('berichte.kunden.topCustomers') }}</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.kunden.customer') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.kunden.group') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.kunden.orders') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.kunden.totalRevenue') }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{{ $t('berichte.kunden.avgOrder') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(customer, index) in data.topCustomers" :key="customer.kundenId" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">{{ index + 1 }}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ customer.name }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ customer.gruppe }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ customer.orderCount }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ formatCurrency(customer.totalRevenue) }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(customer.averageOrderValue) }}</td>
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
const data = ref({ kpis: {}, topCustomers: [], statusDistribution: {}, groupDistribution: [], customersByMonth: [], customersByLocation: [] })
const startDate = ref('')
const endDate = ref('')
const statusChart = ref(null)
const groupChart = ref(null)
const acquisitionChart = ref(null)
const geoChart = ref(null)

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
    const response = await $fetch(`/api/berichte/kunden?startDate=${startDate.value}&endDate=${endDate.value}`)
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
  if (statusChart.value) {
    const chart1 = echarts.init(statusChart.value)
    chart1.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center' },
      series: [{ type: 'pie', radius: ['40%', '70%'], data: Object.entries(data.value.statusDistribution).map(([name, value]) => ({ name, value })) }]
    })
  }
  if (groupChart.value) {
    const chart2 = echarts.init(groupChart.value)
    chart2.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%', left: 'center' },
      series: [{ type: 'pie', radius: '60%', data: data.value.groupDistribution.map(item => ({ name: item.group, value: item.count })) }]
    })
  }
  if (acquisitionChart.value) {
    const chart3 = echarts.init(acquisitionChart.value)
    chart3.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.value.customersByMonth.map(item => item.month) },
      yAxis: { type: 'value' },
      series: [{ data: data.value.customersByMonth.map(item => item.count), type: 'line', smooth: true, areaStyle: { opacity: 0.3 }, itemStyle: { color: '#8B5CF6' } }]
    })
  }
  if (geoChart.value) {
    const chart4 = echarts.init(geoChart.value)
    chart4.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: data.value.customersByLocation.map(item => item.location) },
      series: [{ data: data.value.customersByLocation.map(item => item.count), type: 'bar', itemStyle: { color: '#8B5CF6' } }]
    })
  }
}

const exportData = () => {
  const headers = ['Kunde', 'Gruppe', 'Bestellungen', 'Umsatz']
  const rows = data.value.topCustomers.map(c => [c.name, c.gruppe, c.orderCount, c.totalRevenue.toFixed(2)])
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `kundenbericht_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

onMounted(() => { setQuickRange('lastYear') })
</script>
