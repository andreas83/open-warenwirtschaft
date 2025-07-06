<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <main class="flex-grow ">
      <slot />
    </main>
   
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentYear = new Date().getFullYear()
</script>
