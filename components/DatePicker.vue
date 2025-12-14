<template>
  <div class="relative" ref="containerRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        type="text"
        :value="displayValue"
        @click="toggleCalendar"
        @keydown.enter="toggleCalendar"
        readonly
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full px-3 py-2 pr-10 border rounded-lg transition-all duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-indigo-400',
          error ? 'border-red-300' : 'border-gray-300'
        ]"
      />
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <span class="i-mdi-calendar w-5 h-5 text-gray-400"></span>
      </div>
    </div>

    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>

    <!-- Calendar Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
      >
        <!-- Month/Year Header -->
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            @click="prevMonth"
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span class="i-mdi-chevron-left w-5 h-5"></span>
          </button>

          <div class="flex items-center gap-2">
            <select
              v-model="viewMonth"
              class="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option v-for="(name, idx) in monthNames" :key="idx" :value="idx">
                {{ name }}
              </option>
            </select>
            <select
              v-model="viewYear"
              class="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option v-for="year in yearRange" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <button
            type="button"
            @click="nextMonth"
            class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span class="i-mdi-chevron-right w-5 h-5"></span>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-xs font-medium text-gray-500 py-1"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="day in calendarDays"
            :key="day.date"
            type="button"
            @click="selectDate(day)"
            :disabled="day.disabled"
            :class="[
              'p-2 text-sm rounded-lg transition-all duration-150',
              day.isToday && !day.isSelected ? 'ring-2 ring-indigo-300' : '',
              day.isSelected ? 'bg-indigo-600 text-white' : '',
              day.isCurrentMonth && !day.isSelected ? 'text-gray-700 hover:bg-indigo-50' : '',
              !day.isCurrentMonth && !day.isSelected ? 'text-gray-300' : '',
              day.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            ]"
          >
            {{ day.dayNumber }}
          </button>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-between items-center mt-4 pt-3 border-t">
          <button
            type="button"
            @click="selectToday"
            class="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {{ $t('common.today', 'Heute') }}
          </button>
          <div class="flex gap-2">
            <button
              v-if="clearable && modelValue"
              type="button"
              @click="clearDate"
              class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {{ $t('common.clear', 'Löschen') }}
            </button>
            <button
              type="button"
              @click="isOpen = false"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | Date | null
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  hint?: string
  error?: string
  minDate?: string | Date
  maxDate?: string | Date
  format?: string
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Datum auswählen...',
  clearable: true,
  format: 'dd.MM.yyyy',
  locale: 'de'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
}>()

const containerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const viewMonth = ref(new Date().getMonth())
const viewYear = ref(new Date().getFullYear())

const monthNames = computed(() => {
  if (props.locale === 'en') {
    return ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
  }
  return ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
          'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
})

const weekDays = computed(() => {
  if (props.locale === 'en') {
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  }
  return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
})

const yearRange = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear - 100; y <= currentYear + 20; y++) {
    years.push(y)
  }
  return years
})

const selectedDate = computed(() => {
  if (!props.modelValue) return null
  if (props.modelValue instanceof Date) return props.modelValue
  return new Date(props.modelValue)
})

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return formatDate(selectedDate.value)
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(viewYear.value, viewMonth.value, 1)
  const lastDay = new Date(viewYear.value, viewMonth.value + 1, 0)

  // Adjust for week start (Monday = 0 for DE, Sunday = 0 for EN)
  let startOffset = firstDay.getDay()
  if (props.locale === 'de') {
    startOffset = startOffset === 0 ? 6 : startOffset - 1
  }

  // Previous month days
  const prevMonthLastDay = new Date(viewYear.value, viewMonth.value, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(viewYear.value, viewMonth.value - 1, prevMonthLastDay - i)
    days.push(createDayObject(date, false))
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(viewYear.value, viewMonth.value, d)
    days.push(createDayObject(date, true))
  }

  // Next month days
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(viewYear.value, viewMonth.value + 1, d)
    days.push(createDayObject(date, false))
  }

  return days
})

function createDayObject(date: Date, isCurrentMonth: boolean) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = date.toDateString() === today.toDateString()
  const isSelected = selectedDate.value?.toDateString() === date.toDateString()

  let disabled = false
  if (props.minDate) {
    const min = props.minDate instanceof Date ? props.minDate : new Date(props.minDate)
    disabled = date < min
  }
  if (props.maxDate && !disabled) {
    const max = props.maxDate instanceof Date ? props.maxDate : new Date(props.maxDate)
    disabled = date > max
  }

  return {
    date: date.toISOString(),
    dayNumber: date.getDate(),
    isCurrentMonth,
    isToday,
    isSelected,
    disabled
  }
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  if (props.format === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`
  }
  return `${day}.${month}.${year}`
}

function toggleCalendar() {
  if (props.disabled) return
  isOpen.value = !isOpen.value

  if (isOpen.value && selectedDate.value) {
    viewMonth.value = selectedDate.value.getMonth()
    viewYear.value = selectedDate.value.getFullYear()
  }
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function selectDate(day: { date: string; disabled: boolean }) {
  if (day.disabled) return

  const date = new Date(day.date)
  const value = props.format === 'yyyy-MM-dd'
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : date.toISOString()

  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

function selectToday() {
  const today = new Date()
  const value = props.format === 'yyyy-MM-dd'
    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    : today.toISOString()

  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

function clearDate() {
  emit('update:modelValue', null)
  emit('change', null)
}

// Close on click outside
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      isOpen.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
