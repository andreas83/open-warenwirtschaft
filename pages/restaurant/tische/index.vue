<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">{{ $t('restaurant.tables.title') }}</h1>
        <p class="text-gray-600 mt-1">{{ $t('restaurant.tables.subtitle') }}</p>
      </div>
      <NuxtLink
        to="/restaurant/tische/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
      >
        <span class="i-mdi-plus text-xl"></span>
        {{ $t('restaurant.tables.newTable') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('common.search') }}
          </label>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('restaurant.tables.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debounceSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('restaurant.tables.section') }}
          </label>
          <select
            v-model="filterBereich"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadTables"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option v-for="section in sections" :key="section.BereichID" :value="section.BereichID">
              {{ section.Name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('common.status') }}
          </label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadTables"
          >
            <option value="">{{ $t('common.all') }}</option>
            <option value="Verfuegbar">{{ $t('restaurant.tables.status.available') }}</option>
            <option value="Besetzt">{{ $t('restaurant.tables.status.occupied') }}</option>
            <option value="Reserviert">{{ $t('restaurant.tables.status.reserved') }}</option>
            <option value="Gesperrt">{{ $t('restaurant.tables.status.blocked') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Tables Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="table in tables"
        :key="table.TischID"
        class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200 cursor-pointer"
        @click="navigateTo(`/restaurant/tische/edit/${table.TischID}`)"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">{{ table.Tischnummer }}</h3>
            <p v-if="table.Tischbereiche" class="text-sm text-gray-500">
              {{ table.Tischbereiche.Name }}
            </p>
          </div>
          <span
            :class="getStatusClass(table.Status)"
            class="px-2 py-1 text-xs font-semibold rounded-full"
          >
            {{ getStatusText(table.Status) }}
          </span>
        </div>

        <div class="flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <span class="i-mdi-seat text-lg"></span>
            <span>{{ table.Kapazitaet }} {{ $t('restaurant.tables.seats') }}</span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
          <button
            @click.stop="deleteTable(table.TischID)"
            class="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            {{ $t('common.delete') }}
          </button>
          <NuxtLink
            :to="`/restaurant/tische/edit/${table.TischID}`"
            @click.stop
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {{ $t('common.edit') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && tables.length === 0" class="text-center py-12">
      <span class="i-mdi-table-furniture text-6xl text-gray-400 mb-4"></span>
      <p class="text-gray-500 text-lg">{{ $t('restaurant.tables.noTables') }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="total > limit" class="mt-6 flex justify-center gap-2">
      <button
        @click="goToPage(0)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.first') }}
      </button>
      <button
        @click="goToPage(offset - limit)"
        :disabled="offset === 0"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.previous') }}
      </button>
      <span class="px-3 py-1">
        {{ Math.floor(offset / limit) + 1 }} / {{ Math.ceil(total / limit) }}
      </span>
      <button
        @click="goToPage(offset + limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.next') }}
      </button>
      <button
        @click="goToPage(Math.floor(total / limit) * limit)"
        :disabled="offset + limit >= total"
        class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ $t('pagination.last') }}
      </button>
    </div>
  </div>
</template>

<script setup>
const { $t } = useNuxtApp()
const loading = ref(true)
const tables = ref([])
const sections = ref([])
const total = ref(0)
const limit = ref(20)
const offset = ref(0)
const searchQuery = ref('')
const filterBereich = ref('')
const filterStatus = ref('')
let debounceTimer = null

const loadTables = async () => {
  loading.value = true
  try {
    const params = {
      limit: limit.value,
      offset: offset.value
    }

    if (searchQuery.value) params.search = searchQuery.value
    if (filterBereich.value) params.bereichId = filterBereich.value
    if (filterStatus.value) params.status = filterStatus.value

    const data = await $fetch('/api/restaurant/tische', { params })
    tables.value = data.tables
    total.value = data.total
  } catch (error) {
    console.error('Error loading tables:', error)
  } finally {
    loading.value = false
  }
}

const loadSections = async () => {
  try {
    const data = await $fetch('/api/restaurant/tischbereiche')
    sections.value = data.sections
  } catch (error) {
    console.error('Error loading sections:', error)
  }
}

const debounceSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    offset.value = 0
    loadTables()
  }, 300)
}

const goToPage = (newOffset) => {
  offset.value = newOffset
  loadTables()
}

const deleteTable = async (id) => {
  if (!confirm($t('restaurant.tables.confirmDelete'))) return

  try {
    await $fetch(`/api/restaurant/tische?id=${id}`, { method: 'DELETE' })
    await loadTables()
  } catch (error) {
    alert(error.data?.message || $t('common.error'))
  }
}

const getStatusClass = (status) => {
  const classes = {
    Verfuegbar: 'bg-green-100 text-green-800',
    Besetzt: 'bg-red-100 text-red-800',
    Reserviert: 'bg-yellow-100 text-yellow-800',
    Gesperrt: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status) => {
  const texts = {
    Verfuegbar: $t('restaurant.tables.status.available'),
    Besetzt: $t('restaurant.tables.status.occupied'),
    Reserviert: $t('restaurant.tables.status.reserved'),
    Gesperrt: $t('restaurant.tables.status.blocked')
  }
  return texts[status] || status
}

onMounted(() => {
  loadTables()
  loadSections()
})
</script>
