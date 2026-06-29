<template>
  <section class="form-section">
    <div class="section-header">
      <span class="section-icon" aria-hidden="true">{{ icon }}</span>
      <h2 class="section-title">{{ title }}</h2>
    </div>
    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  icon: String,
  index: Number,
})
</script>

<style scoped>
.form-section {
  background: var(--clr-surface);
  border: 1px solid var(--clr-border);
  border-radius: var(--radius-lg);
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  background: #f8f9fc;
  border-bottom: 1px solid var(--clr-border);
}
.section-icon { font-size: 1.1rem; }
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--clr-primary);
  font-family: 'Outfit', sans-serif;
}
.section-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
