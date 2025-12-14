<template>
  <div class="p-4">
    <!-- Payment Methods -->
    <div class="grid grid-cols-2 gap-2 mb-4">
      <button
        v-for="method in paymentMethods"
        :key="method.value"
        @click="selectedMethod = method.value"
        class="p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all"
        :class="selectedMethod === method.value
          ? 'border-indigo-500 bg-indigo-50'
          : (darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300')
        ">
        <span :class="[method.icon, 'w-6 h-6', selectedMethod === method.value ? 'text-indigo-600' : '']"></span>
        <span class="text-sm font-medium" :class="selectedMethod === method.value ? 'text-indigo-700' : ''">
          {{ $t(method.label) }}
        </span>
      </button>
    </div>

    <!-- Cash Input (only for cash payment) -->
    <div v-if="selectedMethod === 'Bar'" class="mb-4">
      <label class="block text-sm font-medium mb-2"
             :class="{'text-gray-700': !darkMode, 'text-gray-300': darkMode}">
        {{ $t('pos.receivedAmount') }}
      </label>
      <div class="relative">
        <input
          v-model.number="receivedAmount"
          type="number"
          step="0.01"
          :min="total"
          class="w-full px-4 py-3 rounded-lg border text-lg font-bold text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :class="{
            'bg-white border-gray-300': !darkMode,
            'bg-gray-700 border-gray-600 text-white': darkMode
          }"
        />
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">EUR</span>
      </div>

      <!-- Quick Amount Buttons -->
      <div class="grid grid-cols-4 gap-2 mt-2">
        <button
          v-for="amount in quickAmounts"
          :key="amount"
          @click="receivedAmount = amount"
          class="py-2 rounded-lg text-sm font-medium transition-colors"
          :class="{
            'bg-gray-100 hover:bg-gray-200 text-gray-700': !darkMode,
            'bg-gray-700 hover:bg-gray-600 text-gray-300': darkMode
          }">
          {{ formatCurrency(amount) }}
        </button>
      </div>

      <!-- Change Display -->
      <div v-if="changeAmount > 0" class="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
        <div class="flex justify-between items-center">
          <span class="text-yellow-700 font-medium">{{ $t('pos.change') }}</span>
          <span class="text-2xl font-bold text-yellow-600">{{ formatCurrency(changeAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Checkout Button -->
    <button
      @click="handleCheckout"
      :disabled="!canCheckout || processing"
      class="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
      :class="canCheckout && !processing
        ? 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-[0.98]'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      ">
      <span v-if="processing" class="i-svg-spinners-ring-resize w-6 h-6"></span>
      <span v-else class="i-mdi-credit-card-check w-6 h-6"></span>
      {{ processing ? $t('pos.processing') : $t('pos.completePayment') }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  processing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['checkout'])

const paymentMethods = [
  { value: 'Bar', label: 'kassen.payment.cash', icon: 'i-mdi-cash' },
  { value: 'EC-Karte', label: 'kassen.payment.ecCard', icon: 'i-mdi-credit-card' },
  { value: 'Kreditkarte', label: 'kassen.payment.creditCard', icon: 'i-mdi-credit-card-outline' },
  { value: 'Gutschein', label: 'kassen.payment.voucher', icon: 'i-mdi-ticket-percent' }
]

const selectedMethod = ref('Bar')
const receivedAmount = ref(0)

const quickAmounts = computed(() => {
  const amounts = [5, 10, 20, 50]
  // Add exact amount and rounded amounts based on total
  const roundedUp = Math.ceil(props.total / 5) * 5
  if (roundedUp > 0 && !amounts.includes(roundedUp)) {
    amounts.push(roundedUp)
  }
  return amounts.sort((a, b) => a - b).slice(0, 4)
})

const changeAmount = computed(() => {
  if (selectedMethod.value !== 'Bar') return 0
  return Math.max(0, receivedAmount.value - props.total)
})

const canCheckout = computed(() => {
  if (props.total <= 0) return false
  if (selectedMethod.value === 'Bar') {
    return receivedAmount.value >= props.total
  }
  return true
})

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}

function handleCheckout() {
  if (!canCheckout.value) return

  emit('checkout', {
    method: selectedMethod.value,
    receivedAmount: selectedMethod.value === 'Bar' ? receivedAmount.value : null
  })
}

// Reset received amount when total changes
watch(() => props.total, (newTotal) => {
  if (newTotal > 0) {
    receivedAmount.value = Math.ceil(newTotal / 5) * 5
  } else {
    receivedAmount.value = 0
  }
}, { immediate: true })
</script>
