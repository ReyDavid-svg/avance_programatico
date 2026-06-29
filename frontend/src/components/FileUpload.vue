<template>
  <div
    class="dropzone"
    :class="{ dragging, 'has-file': archivo }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
    @click="$refs.input.click()"
  >
    <input ref="input" type="file" :accept="accept" style="display:none" @change="onFileChange" />
    <div v-if="!archivo" class="idle">
      <span class="dz-icon">☁</span>
      <p>Arrastra aquí el archivo</p>
      <p class="or">o</p>
      <span class="link">Seleccionar archivo</span>
    </div>
    <div v-else class="selected">
      <span class="file-ico"></span>
      <span class="file-name">{{ archivo.name }}</span>
      <button type="button" class="remove" @click.stop="quitar" aria-label="Eliminar">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['file-selected'])
const accept = '.pdf,.xls,.xlsx,.ods,.jpeg,.jpg'
const archivo = ref(null)
const dragging = ref(false)

function ok(file) {
  if (!/\.(pdf|xls|xlsx|ods|jpeg|jpg)$/i.test(file.name)) { alert('Tipo no permitido.'); return false }
  if (file.size > 5 * 1024 * 1024) { alert('Archivo mayor a 5 MB.'); return false }
  return true
}
function onFileChange(e) { const f = e.target.files[0]; if (f && ok(f)) { archivo.value = f; emit('file-selected', f) } }
function onDrop(e) { dragging.value = false; const f = e.dataTransfer.files[0]; if (f && ok(f)) { archivo.value = f; emit('file-selected', f) } }
function quitar() { archivo.value = null; emit('file-selected', null) }
</script>

<style scoped>
.dropzone {
  border: 2px dashed var(--gray-200); border-radius: var(--radius);
  padding: 20px 16px; text-align: center; cursor: pointer;
  transition: border-color .2s, background .2s; background: var(--white);
  font-size: 0.83rem; color: var(--gray-400);
}
.dropzone:hover, .dropzone.dragging { border-color: var(--primary); background: var(--blue-light); }
.dropzone.has-file { border-style: solid; border-color: var(--green); background: var(--green-bg); }
.idle { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.dz-icon { font-size: 1.8rem; color: var(--gray-300); }
.or { color: var(--gray-300); font-size: 0.75rem; }
.link { color: var(--primary); font-weight: 500; font-size: 0.82rem; }
.selected { display: flex; align-items: center; justify-content: center; gap: 8px; }
.file-ico { font-size: 1.2rem; }
.file-name { color: var(--gray-700); font-weight: 500; word-break: break-all; font-size: 0.83rem; }
.remove {
  background: none; border: 1.5px solid var(--gray-300); border-radius: 50%;
  width: 20px; height: 20px; font-size: 0.65rem; color: var(--gray-400);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all .15s;
}
.remove:hover { border-color: var(--red); color: var(--red); }
</style>
