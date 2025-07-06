<template>
  <div class="container mx-auto py-6">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">{{ $t('rechnungen.dashboardTitle') }}</h2>
    <div v-if="loading" class="text-center text-gray-500 py-10">{{ $t('rechnungen.loadingData') }}</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">{{ error }}</div>
    <div v-else>
      <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div class="flex flex-col md:flex-row gap-3 items-center w-full md:w-auto">
          <div class="relative w-full md:w-64">
            <input v-model="dateRangeText" type="text" :placeholder="$t('rechnungen.selectDateRange')" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" @click="toggleDatePicker" readonly>
            <svg class="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div v-if="showDatePicker" class="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 mt-2 md:mt-0 md:ml-64">
            <div class="flex flex-col gap-2">
              <button @click="setDateRange('lastMonth')" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200">{{ $t('rechnungen.lastMonth') }}</button>
              <button @click="setDateRange('lastYear')" class="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200">{{ $t('rechnungen.lastYear') }}</button>
              <div class="flex justify-between">
                <input v-model="startDate" type="date" class="border border-gray-300 rounded-lg px-2 py-1">
                <input v-model="endDate" type="date" class="border border-gray-300 rounded-lg px-2 py-1">
              </div>
              <button @click="applyDateRange" class="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-200">{{ $t('rechnungen.apply') }}</button>
            </div>
          </div>
          <select v-model="statusFilter" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-48" @change="fetchRechnungen">
            <option value="">{{ $t('rechnungen.allStatuses') }}</option>
            <option value="Offen">{{ $t('rechnungen.status.open') }}</option>
            <option value="Teilbezahlt">{{ $t('rechnungen.status.partiallyPaid') }}</option>
            <option value="Bezahlt">{{ $t('rechnungen.status.paid') }}</option>
            <option value="Überfällig">{{ $t('rechnungen.status.overdue') }}</option>
            <option value="Storniert">{{ $t('rechnungen.status.cancelled') }}</option>
          </select>
          <Autocomplete
            id="kundeFilter"
            :items="kunden"
            :idKey="'KundenID'"
            :displayFn="getKundeDisplayName"
            :filterFn="filterKunden"
            :placeholder="$t('rechnungen.searchCustomer')"
            @select="handleKundeSelect"
            @search="handleKundeSearch"
            class="w-full md:w-64"
            ref="kundeAutocomplete"
          />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('rechnungen.totalAmountOverTime') }}</h3>
          <ClientOnly>
            <div id="totalAmountChart" style="height: 300px;"></div>
          </ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('rechnungen.statusDistribution') }}</h3>
          <ClientOnly>
            <div id="statusChart" style="height: 300px;"></div>
          </ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('rechnungen.topCustomers') }}</h3>
          <ClientOnly>
            <div id="customerChart" style="height: 300px;"></div>
          </ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('rechnungen.overdueInvoices') }}</h3>
          <ClientOnly>
            <div id="overdueChart" style="height: 300px;"></div>
          </ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('rechnungen.averageInvoiceValue') }}</h3>
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <p class="text-3xl font-bold text-blue-600">{{ averageInvoiceValue }} EUR</p>
              <p class="text-gray-500 text-sm">{{ $t('rechnungen.averageInvoiceValueDescription') }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('rechnungen.paymentMethodsDistribution') }}</h3>
          <ClientOnly>
            <div id="paymentMethodsChart" style="height: 300px;"></div>
          </ClientOnly>
        </div>
        <div class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition duration-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ $t('rechnungen.invoiceCountByMonth') }}</h3>
          <ClientOnly>
            <div id="invoiceCountChart" style="height: 300px;"></div>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'
import Autocomplete from '~/components/Autocomplete.vue'

// Data variables
const { t } = useI18n()
const rechnungen = ref([])
const loading = ref(true)
const error = ref(null)
const startDate = ref('')
const endDate = ref('')
const showDatePicker = ref(false)
const dateRangeText = ref('')
const statusFilter = ref('')
const kundeFilter = ref('')
const kunden = ref([])

// Fetch Rechnungen from API
// Fetch Rechnungen from API
async function fetchRechnungen() {
  try {
    loading.value = true
    let url = `/api/rechnungen?limit=1000`
    if (startDate.value && endDate.value) {
      url += `&startDate=${encodeURIComponent(startDate.value)}&endDate=${encodeURIComponent(endDate.value)}`
    }
    if (statusFilter.value) {
      url += `&status=${encodeURIComponent(statusFilter.value)}`
    }
    if (kundeFilter.value) {
      url += `&kunde=${encodeURIComponent(kundeFilter.value)}`
    }
    const response = await $fetch(url)
    if (Array.isArray(response)) {
      rechnungen.value = response
    } else {
      rechnungen.value = []
      error.value = t('rechnungen.noDataFound')
    }
  } catch (err) {
    error.value = t('rechnungen.errorLoadingData') + err.message
    rechnungen.value = []
    console.error('Fetch Rechnungen Error:', err)
  } finally {
    loading.value = false
  }
}

// Fetch Kunden for filter dropdown with server-side search
async function fetchKunden(search = '') {
  try {
    let url = '/api/kunden?limit=20';
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await $fetch(url);
    if (Array.isArray(response)) {
      kunden.value = response;
    } else {
      console.error('Failed to fetch kunden');
    }
  } catch (err) {
    console.error('Fetch Kunden Error:', err);
  }
}

// Helper function to get display name for Kunde
function getKundeDisplayName(kunde) {
  if (kunde.Firmenname) return kunde.Firmenname
  return `${kunde.Vorname || ''} ${kunde.Nachname || ''}`.trim() || 'Unbekannt'
}

// Filter function for Autocomplete component (not used with server-side search)
function filterKunden(kunde, search) {
  // With server-side search, filtering is handled by API
  return true;
}

// Handle selection from Autocomplete component
function handleKundeSelect(kunde) {
  kundeFilter.value = kunde ? kunde.KundenID : '';
  fetchRechnungen();
}

// Handle search input in Autocomplete for server-side search
function handleKundeSearch(search) {
  fetchKunden(search);
}

// Toggle date picker visibility
function toggleDatePicker() {
  showDatePicker.value = !showDatePicker.value
}

// Set predefined date ranges
function setDateRange(range) {
  const today = new Date()
  if (range === 'lastMonth') {
    const lastMonth = new Date(today.setFullYear(today.getFullYear(), today.getMonth() - 1))
    startDate.value = lastMonth.toISOString().split('T')[0]
    endDate.value = new Date().toISOString().split('T')[0]
  } else if (range === 'lastYear') {
    const lastYear = new Date(today.setFullYear(today.getFullYear() - 1))
    startDate.value = lastYear.toISOString().split('T')[0]
    endDate.value = new Date().toISOString().split('T')[0]
  }
  dateRangeText.value = `${startDate.value} - ${endDate.value}`
  showDatePicker.value = false
  fetchRechnungen()
}

// Apply custom date range
function applyDateRange() {
  if (startDate.value && endDate.value) {
    dateRangeText.value = `${startDate.value} - ${endDate.value}`
    showDatePicker.value = false
    fetchRechnungen()
  }
}

// Chart options for Total Amount Over Time
const totalAmountChartOption = computed(() => {
  const data = aggregateByDate(rechnungen.value)
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} EUR'
      }
    },
    series: [{
      data: data.map(item => item.amount),
      type: 'line',
      smooth: true,
      lineStyle: {
        color: '#007bff'
      },
      itemStyle: {
        color: '#007bff'
      }
    }]
  }
})

// Chart options for Status Distribution
const statusChartOption = computed(() => {
  const statusCounts = aggregateByStatus(rechnungen.value)
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [{
      name: 'Status',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: statusCounts.map(item => ({ value: item.count, name: item.status }))
    }]
  }
})

// Chart options for Top Customers
const customerChartOption = computed(() => {
  const customerData = aggregateByCustomer(rechnungen.value)
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: customerData.map(item => item.name),
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} EUR'
      }
    },
    series: [{
      data: customerData.map(item => item.amount),
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: '#007bff'
      }
    }]
  }
})

// Chart options for Overdue Invoices
const overdueChartOption = computed(() => {
  const overdueData = aggregateOverdueInvoices(rechnungen.value)
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [{
      name: 'Overdue Status',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: overdueData.overdueCount, name: t('rechnungen.status.overdue') },
        { value: overdueData.totalCount - overdueData.overdueCount, name: t('rechnungen.other') }
      ]
    }]
  }
})

// Computed property for Average Invoice Value
const averageInvoiceValue = computed(() => {
  if (rechnungen.value.length === 0) return '0.00'
  const total = rechnungen.value.reduce((sum, rechnung) => sum + Number(rechnung.GesamtbetragBrutto) || 0, 0)
  return (total / rechnungen.value.length).toFixed(2)
})

// Chart options for Payment Methods Distribution
const paymentMethodsChartOption = computed(() => {
  const paymentData = aggregateByPaymentMethod(rechnungen.value)
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [{
      name: 'Payment Method',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: paymentData.map(item => ({ value: item.count, name: item.method }))
    }]
  }
})

// Chart options for Invoice Count by Month
const invoiceCountChartOption = computed(() => {
  const countData = aggregateInvoiceCountByMonth(rechnungen.value)
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: countData.map(item => item.month),
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [{
      data: countData.map(item => item.count),
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: '#007bff'
      }
    }]
  }
})

// Aggregate data by date for line chart
function aggregateByDate(data) {
  const aggregated = {}
  data.forEach(rechnung => {
    if (rechnung.Rechnungsdatum) {
      const date = new Date(rechnung.Rechnungsdatum).toISOString().split('T')[0].substring(0, 7) // YYYY-MM
      if (!aggregated[date]) {
        aggregated[date] = { date, amount: 0 }
      }
      aggregated[date].amount += Number(rechnung.GesamtbetragBrutto) || 0
    }
  })
  return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date))
}

// Aggregate data by status for pie chart
function aggregateByStatus(data) {
  const aggregated = {}
  data.forEach(rechnung => {
    const status = rechnung.Zahlungsstatus || 'Unbekannt'
    if (!aggregated[status]) {
      aggregated[status] = { status, count: 0 }
    }
    aggregated[status].count += 1
  })
  return Object.values(aggregated)
}

// Aggregate data by customer for bar chart
function aggregateByCustomer(data) {
  const aggregated = {}
  data.forEach(rechnung => {
    let name = 'Unbekannt'
    if (rechnung.Kunden) {
      name = rechnung.Kunden.Firmenname || `${rechnung.Kunden.Vorname || ''} ${rechnung.Kunden.Nachname || ''}`.trim() || 'Unbekannt'
    }
    if (!aggregated[name]) {
      aggregated[name] = { name, amount: 0 }
    }
    aggregated[name].amount += Number(rechnung.GesamtbetragBrutto) || 0
  })
  return Object.values(aggregated).sort((a, b) => b.amount - a.amount).slice(0, 10) // Top 10 customers
}

// Aggregate data for overdue invoices
function aggregateOverdueInvoices(data) {
  const today = new Date().toISOString().split('T')[0]
  let overdueCount = 0
  let totalCount = data.length
  data.forEach(rechnung => {
    if (rechnung.Faelligkeitsdatum && rechnung.Faelligkeitsdatum < today && rechnung.Zahlungsstatus === 'Offen') {
      overdueCount += 1
    }
  })
  return { overdueCount, totalCount }
}

// Aggregate data by payment method
function aggregateByPaymentMethod(data) {
  const aggregated = {}
  data.forEach(rechnung => {
    if (rechnung.Zahlungen && rechnung.Zahlungen.length > 0) {
      const method = rechnung.Zahlungen[0].Zahlungsart || 'Unbekannt'
      if (!aggregated[method]) {
        aggregated[method] = { method, count: 0 }
      }
      aggregated[method].count += 1
    } else {
      const method = 'Unbekannt'
      if (!aggregated[method]) {
        aggregated[method] = { method, count: 0 }
      }
      aggregated[method].count += 1
    }
  })
  return Object.values(aggregated)
}

// Aggregate invoice count by month
function aggregateInvoiceCountByMonth(data) {
  const aggregated = {}
  data.forEach(rechnung => {
    if (rechnung.Rechnungsdatum) {
      const month = new Date(rechnung.Rechnungsdatum).toISOString().split('T')[0].substring(0, 7) // YYYY-MM
      if (!aggregated[month]) {
        aggregated[month] = { month, count: 0 }
      }
      aggregated[month].count += 1
    }
  })
  return Object.values(aggregated).sort((a, b) => a.month.localeCompare(b.month))
}

// Watch for changes in date range
watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    dateRangeText.value = `${startDate.value} - ${endDate.value}`
  }
})

// Initial setup
onMounted(async () => {
  // Set default range to last year
  setDateRange('lastYear')
  await fetchRechnungen()
  await fetchKunden()
  // Delay chart initialization to ensure DOM is ready
  setTimeout(initializeCharts, 100)
})

// Initialize charts after data is loaded
function initializeCharts() {
  if (typeof window !== 'undefined') {
    const totalAmountElement = document.getElementById('totalAmountChart')
    if (totalAmountElement) {
      const totalAmountChart = echarts.init(totalAmountElement)
      totalAmountChart.setOption(totalAmountChartOption.value)
    }
    
    const statusElement = document.getElementById('statusChart')
    if (statusElement) {
      const statusChart = echarts.init(statusElement)
      statusChart.setOption(statusChartOption.value)
    }
    
    const customerElement = document.getElementById('customerChart')
    if (customerElement) {
      const customerChart = echarts.init(customerElement)
      customerChart.setOption(customerChartOption.value)
    }
    
    const overdueElement = document.getElementById('overdueChart')
    if (overdueElement) {
      const overdueChart = echarts.init(overdueElement)
      overdueChart.setOption(overdueChartOption.value)
    }
    
    const paymentMethodsElement = document.getElementById('paymentMethodsChart')
    if (paymentMethodsElement) {
      const paymentMethodsChart = echarts.init(paymentMethodsElement)
      paymentMethodsChart.setOption(paymentMethodsChartOption.value)
    }
    
    const invoiceCountElement = document.getElementById('invoiceCountChart')
    if (invoiceCountElement) {
      const invoiceCountChart = echarts.init(invoiceCountElement)
      invoiceCountChart.setOption(invoiceCountChartOption.value)
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
