<template>
  <div class="form-field">
    <label class="field-label">
      {{ label }}
      <span v-if="required" class="req" aria-hidden="true">*</span>
    </label>
    <slot />
    <span v-if="error" class="error-msg" role="alert">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  required: Boolean,
  error: String,
})
</script>

<style scoped>
.form-field { display: flex; flex-direction: column; gap: 5px; }
.field-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--clr-text);
}
.req { color: #c0392b; margin-left: 2px; }
.error-msg {
  color: #c0392b;
  font-size: 0.78rem;
}
</style>
