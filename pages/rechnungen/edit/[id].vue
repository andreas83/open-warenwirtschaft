<template>
  <div>
    <RechnungForm mode="edit" :id="id" />
  </div>
</template>

<script setup>
import RechnungForm from '~/components/RechnungForm.vue'

const route = useRoute()
const id = route.params.id
</script>
