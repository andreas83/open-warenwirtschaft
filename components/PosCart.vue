<template>
  <div class="h-full flex flex-col">
    <!-- Cart Header -->
    <div class="p-4 border-b flex items-center justify-between"
         :class="{'border-gray-200': !darkMode, 'border-gray-700': darkMode}">
      <h2 class="font-bold text-lg flex items-center gap-2"
          :class="{'text-gray-800': !darkMode, 'text-white': darkMode}">
        <span class="i-mdi-cart w-5 h-5"></span>
        {{ $t('pos.cart') }}
        <span v-if="items.length" class="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
          {{ totalItems }}
        </span>
      </h2>
      <button
        v-if="items.length"
        @click="$emit('clearCart')"
        class="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
        <span class="i-mdi-delete-outline w-4 h-4"></span>
        {{ $t('pos.clearCart') }}
      </button>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-auto">
      <div v-if="items.length === 0" class="flex flex-col items-center justify-center h-full p-6"
           :class="{'text-gray-400': !darkMode, 'text-gray-500': darkMode}">
        <span class="i-mdi-cart-outline w-16 h-16 mb-4 opacity-50"></span>
        <p class="text-center">{{ $t('pos.cartEmpty') }}</p>
      </div>

      <div v-else class="divide-y" :class="{'divide-gray-200': !darkMode, 'divide-gray-700': darkMode}">
        <div
          v-for="(item, index) in items"
          :key="item.produktId"
          class="p-3 flex gap-3">
          <!-- Product Image -->
          <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
               :class="{'bg-gray-700': darkMode}">
            <img
              v-if="item.bild"
              :src="item.bild"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="i-mdi-package-variant w-8 h-8 opacity-30"></span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate"
               :class="{'text-gray-800': !darkMode, 'text-white': darkMode}">
              {{ item.name }}
            </p>
            <p class="text-indigo-600 font-semibold">{{ formatCurrency(item.preis) }}</p>

            <!-- Quantity Controls -->
            <div class="flex items-center gap-2 mt-2">
              <button
                @click="$emit('updateQuantity', index, item.menge - 1)"
                class="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                :class="{
                  'border-gray-300 hover:bg-gray-100': !darkMode,
                  'border-gray-600 hover:bg-gray-700': darkMode
                }">
                <span class="i-mdi-minus w-4 h-4"></span>
              </button>

              <input
                :value="item.menge"
                type="number"
                min="1"
                class="w-12 h-8 text-center rounded-lg border text-sm"
                :class="{
                  'bg-white border-gray-300': !darkMode,
                  'bg-gray-700 border-gray-600 text-white': darkMode
                }"
                @change="$emit('updateQuantity', index, parseInt($event.target.value) || 1)"
              />

              <button
                @click="$emit('updateQuantity', index, item.menge + 1)"
                class="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                :class="{
                  'border-gray-300 hover:bg-gray-100': !darkMode,
                  'border-gray-600 hover:bg-gray-700': darkMode
                }">
                <span class="i-mdi-plus w-4 h-4"></span>
              </button>

              <button
                @click="$emit('removeItem', index)"
                class="ml-auto p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                :class="{'hover:bg-red-900/20': darkMode}">
                <span class="i-mdi-delete w-5 h-5"></span>
              </button>
            </div>
          </div>

          <!-- Line Total -->
          <div class="text-right flex-shrink-0">
            <p class="font-bold" :class="{'text-gray-800': !darkMode, 'text-white': darkMode}">
              {{ formatCurrency(item.preis * item.menge) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Summary -->
    <div v-if="items.length" class="p-4 border-t space-y-2"
         :class="{'border-gray-200 bg-gray-50': !darkMode, 'border-gray-700 bg-gray-800': darkMode}">
      <div class="flex justify-between text-sm"
           :class="{'text-gray-600': !darkMode, 'text-gray-400': darkMode}">
        <span>{{ $t('pos.subtotal') }} ({{ totalItems }} {{ $t('pos.items') }})</span>
        <span>{{ formatCurrency(subtotal) }}</span>
      </div>
      <div class="flex justify-between text-sm"
           :class="{'text-gray-600': !darkMode, 'text-gray-400': darkMode}">
        <span>{{ $t('pos.tax') }}</span>
        <span>{{ formatCurrency(taxTotal) }}</span>
      </div>
      <div class="flex justify-between text-xl font-bold pt-2 border-t"
           :class="{'border-gray-200 text-gray-800': !darkMode, 'border-gray-600 text-white': darkMode}">
        <span>{{ $t('pos.total') }}</span>
        <span class="text-indigo-600">{{ formatCurrency(total) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  darkMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['updateQuantity', 'removeItem', 'clearCart'])

const totalItems = computed(() => {
  return props.items.reduce((sum, item) => sum + item.menge, 0)
})

const total = computed(() => {
  return props.items.reduce((sum, item) => sum + (item.preis * item.menge), 0)
})

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => {
    const mwstFaktor = 1 + (item.mwstSatz / 100)
    return sum + ((item.preis / mwstFaktor) * item.menge)
  }, 0)
})

const taxTotal = computed(() => {
  return total.value - subtotal.value
})

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0)
}
</script>
