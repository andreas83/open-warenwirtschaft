<template>
  <div>
    <ProduktForm mode="edit" :id="id" />
  </div>
</template>

<script setup>
import ProduktForm from '~/components/ProduktForm.vue'


const route = useRoute()
const id = route.params.id
</script>
