<template>
  <div>
    <h1>Willkommen zur Startseite</h1>
    <p>Sie werden automatisch zum Dashboard weitergeleitet...</p>
  </div>
</template>

<script>
export default {
  name: 'Startseite',
  mounted() {
    this.$router.push('/rechnungen/dashboard');
  }
};
</script>

<style scoped>
div {
  text-align: center;
  padding: 50px;
}
h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}
p {
  color: #555;
}
</style>
