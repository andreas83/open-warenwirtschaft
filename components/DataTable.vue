<template>
  <div class="w-full">
    <!-- Search and Actions Bar -->
    <div v-if="searchable || $slots.actions" class="flex flex-col sm:flex-row gap-3 mb-4">
      <div v-if="searchable" class="flex-1">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 i-mdi-magnify w-5 h-5 text-secondary-400"></span>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <LoadingSpinner :text="loadingText" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredData.length === 0" class="text-center py-12 bg-secondary-50 rounded-lg">
      <span class="i-mdi-database-off w-12 h-12 text-secondary-300 mx-auto mb-4"></span>
      <p class="text-secondary-500">{{ emptyText }}</p>
    </div>

    <!-- Table View (Desktop) -->
    <div v-else class="hidden md:block overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-secondary-200">
            <th v-if="selectable" class="px-4 py-3 text-left">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected && !allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-4 py-3 text-left text-sm font-semibold text-secondary-700',
                column.sortable ? 'cursor-pointer hover:bg-secondary-50 select-none' : '',
                column.align === 'center' ? 'text-center' : '',
                column.align === 'right' ? 'text-right' : '',
                column.width ? `w-${column.width}` : ''
              ]"
              @click="column.sortable && toggleSort(column.key)"
            >
              <div class="flex items-center gap-1" :class="{ 'justify-center': column.align === 'center', 'justify-end': column.align === 'right' }">
                {{ column.label }}
                <span v-if="column.sortable && sortKey === column.key" :class="[sortOrder === 'asc' ? 'i-mdi-arrow-up' : 'i-mdi-arrow-down', 'w-4 h-4']"></span>
                <span v-else-if="column.sortable" class="i-mdi-unfold-more-horizontal w-4 h-4 text-secondary-300"></span>
              </div>
            </th>
            <th v-if="$slots.rowActions" class="px-4 py-3 text-right text-sm font-semibold text-secondary-700">
              {{ actionsLabel }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-secondary-100">
          <tr
            v-for="(row, index) in paginatedData"
            :key="getRowKey(row, index)"
            :class="[
              'transition-colors duration-150',
              hoverable ? 'hover:bg-secondary-50' : '',
              striped && index % 2 === 1 ? 'bg-secondary-50/50' : '',
              isSelected(row) ? 'bg-primary-50' : ''
            ]"
          >
            <td v-if="selectable" class="px-4 py-3">
              <input
                type="checkbox"
                :checked="isSelected(row)"
                @change="toggleSelect(row)"
                class="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-4 py-3 text-sm',
                column.align === 'center' ? 'text-center' : '',
                column.align === 'right' ? 'text-right' : ''
              ]"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="getCellValue(row, column.key)">
                {{ formatCell(row, column) }}
              </slot>
            </td>
            <td v-if="$slots.rowActions" class="px-4 py-3 text-right">
              <slot name="rowActions" :row="row" :index="index"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Card View (Mobile) -->
    <div v-if="!loading && filteredData.length > 0" class="md:hidden space-y-3">
      <div
        v-for="(row, index) in paginatedData"
        :key="getRowKey(row, index)"
        :class="[
          'bg-white border rounded-lg p-4 shadow-sm',
          isSelected(row) ? 'border-primary-300 bg-primary-50' : 'border-secondary-200'
        ]"
      >
        <div v-if="selectable" class="flex items-center justify-between mb-3 pb-3 border-b border-secondary-200">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="isSelected(row)"
              @change="toggleSelect(row)"
              class="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="text-sm text-secondary-500">{{ $t('common.select', 'Auswählen') }}</span>
          </label>
        </div>

        <div class="space-y-2">
          <div
            v-for="column in columns"
            :key="column.key"
            class="flex justify-between items-start gap-2"
          >
            <span class="text-sm font-medium text-secondary-500 flex-shrink-0">{{ column.label }}:</span>
            <span class="text-sm text-secondary-900 text-right">
              <slot :name="`cell-${column.key}`" :row="row" :value="getCellValue(row, column.key)">
                {{ formatCell(row, column) }}
              </slot>
            </span>
          </div>
        </div>

        <div v-if="$slots.rowActions" class="mt-4 pt-3 border-t border-secondary-200 flex justify-end gap-2">
          <slot name="rowActions" :row="row" :index="index"></slot>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="paginated && filteredData.length > 0" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-sm text-secondary-500">
        {{ paginationInfo }}
      </div>
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @update:page="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
  searchable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  format?: (value: any, row: any) => string
}

interface Props {
  columns: Column[]
  data: any[]
  rowKey?: string
  loading?: boolean
  loadingText?: string
  emptyText?: string
  searchable?: boolean
  searchPlaceholder?: string
  paginated?: boolean
  pageSize?: number
  selectable?: boolean
  selectedRows?: any[]
  striped?: boolean
  hoverable?: boolean
  actionsLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  loading: false,
  loadingText: 'Laden...',
  emptyText: 'Keine Daten vorhanden',
  searchable: false,
  searchPlaceholder: 'Suchen...',
  paginated: false,
  pageSize: 10,
  selectable: false,
  selectedRows: () => [],
  striped: false,
  hoverable: true,
  actionsLabel: 'Aktionen'
})

const emit = defineEmits<{
  'update:selectedRows': [rows: any[]]
  sort: [key: string, order: 'asc' | 'desc']
  search: [query: string]
}>()

const { t } = useI18n()

const searchQuery = ref('')
const currentPage = ref(1)
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const localSelectedRows = ref<any[]>([...props.selectedRows])

// Watch for external selectedRows changes
watch(() => props.selectedRows, (newVal) => {
  localSelectedRows.value = [...newVal]
}, { deep: true })

// Reset page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
  emit('search', searchQuery.value)
})

const filteredData = computed(() => {
  let result = [...props.data]

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const searchableColumns = props.columns.filter(c => c.searchable !== false)

    result = result.filter(row => {
      return searchableColumns.some(col => {
        const value = getCellValue(row, col.key)
        return String(value).toLowerCase().includes(query)
      })
    })
  }

  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = getCellValue(a, sortKey.value!)
      const bVal = getCellValue(b, sortKey.value!)

      let comparison = 0
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1

      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  }

  return result
})

const totalPages = computed(() => {
  if (!props.paginated) return 1
  return Math.ceil(filteredData.value.length / props.pageSize)
})

const paginatedData = computed(() => {
  if (!props.paginated) return filteredData.value

  const start = (currentPage.value - 1) * props.pageSize
  return filteredData.value.slice(start, start + props.pageSize)
})

const paginationInfo = computed(() => {
  const total = filteredData.value.length
  const start = (currentPage.value - 1) * props.pageSize + 1
  const end = Math.min(currentPage.value * props.pageSize, total)

  return t('common.showingEntries', { start, end, total }, `Zeige ${start}-${end} von ${total}`)
})

const allSelected = computed(() => {
  if (paginatedData.value.length === 0) return false
  return paginatedData.value.every(row => isSelected(row))
})

const someSelected = computed(() => {
  return localSelectedRows.value.length > 0
})

function getRowKey(row: any, index: number): string | number {
  return row[props.rowKey] ?? index
}

function getCellValue(row: any, key: string): any {
  // Support nested keys like 'user.name'
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

function formatCell(row: any, column: Column): string {
  const value = getCellValue(row, column.key)

  if (column.format) {
    return column.format(value, row)
  }

  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no')

  return String(value)
}

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}

function isSelected(row: any): boolean {
  const key = getRowKey(row, -1)
  return localSelectedRows.value.some(r => getRowKey(r, -1) === key)
}

function toggleSelect(row: any) {
  const key = getRowKey(row, -1)
  const index = localSelectedRows.value.findIndex(r => getRowKey(r, -1) === key)

  if (index === -1) {
    localSelectedRows.value.push(row)
  } else {
    localSelectedRows.value.splice(index, 1)
  }

  emit('update:selectedRows', localSelectedRows.value)
}

function toggleSelectAll() {
  if (allSelected.value) {
    // Deselect all on current page
    paginatedData.value.forEach(row => {
      const key = getRowKey(row, -1)
      const index = localSelectedRows.value.findIndex(r => getRowKey(r, -1) === key)
      if (index !== -1) {
        localSelectedRows.value.splice(index, 1)
      }
    })
  } else {
    // Select all on current page
    paginatedData.value.forEach(row => {
      if (!isSelected(row)) {
        localSelectedRows.value.push(row)
      }
    })
  }

  emit('update:selectedRows', localSelectedRows.value)
}
</script>
