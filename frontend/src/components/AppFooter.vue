<template>
  <footer class="footer">
    <p>{{ year }} Universidad de la Sierra Sur — Departamento de Servicios Escolares</p>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--clr-primary);
  color: rgba(255,255,255,0.5);
  text-align: center;
  padding: 1rem;
  font-size: 0.78rem;
  margin-top: 2rem;
}
</style>
