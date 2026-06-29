<template>
  <div class="panel">

    <!-- CABECERA -->
    <div class="panel-header">
      <div>
        <h2 class="panel-title">Gestión de docentes</h2>
        <p class="panel-sub">Administra las cuentas de los profesores que registran avances</p>
      </div>
      <button class="btn-primary" @click="abrirModal()">
        <span aria-hidden="true">+</span> Agregar docente
      </button>
    </div>

    <!-- FILTROS -->
    <div class="filtros">
      <div class="search-wrap">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar por nombre o correo..."
          class="search-input"
        />
      </div>
      <div class="filter-chips">
        <button v-for="f in filtros" :key="f.val"
          class="fchip" :class="{ active: filtroActivo === f.val }"
          @click="filtroActivo = f.val">{{ f.label }}</button>
      </div>
    </div>

    <!-- ESTADO CARGA / ERROR / VACÍO -->
    <div v-if="cargando" class="estado">
      <div class="spinner"></div>
      <span>Cargando docentes…</span>
    </div>
    <div v-else-if="error" class="estado estado-error">⚠ {{ error }}</div>
    <div v-else-if="!docentesFiltrados.length" class="estado">
      <span style="font-size:2rem"></span>
      <p>{{ busqueda ? `Sin resultados para "${busqueda}"` : 'No hay docentes registrados aún.' }}</p>
    </div>

    <!-- TABLA DESKTOP -->
    <div v-else class="table-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Alta</th>
            <th class="th-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in docentesFiltrados" :key="d.id" :class="{ inactivo: !d.activo }">
            <td>
              <div class="docente-cell">
                <div class="doc-avatar">{{ iniciales(d.nombre) }}</div>
                <span class="doc-nombre">{{ d.nombre }}</span>
              </div>
            </td>
            <td class="td-muted">{{ d.email }}</td>
            <td>
              <span class="badge" :class="d.activo ? 'badge-green' : 'badge-gray'">
                {{ d.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="td-muted td-small">{{ formatFecha(d.created_at) }}</td>
            <td class="th-right">
              <div class="acciones">
                <button class="btn-icon" title="Editar" @click="abrirModal(d)">✏</button>
                <button class="btn-icon btn-icon-warn" title="Cambiar contraseña" @click="abrirCambioPass(d)">🔑</button>
                <button v-if="d.activo"  class="btn-icon btn-icon-danger"  title="Desactivar"  @click="confirmarEliminar(d)">✕</button>
                <button v-else           class="btn-icon btn-icon-success" title="Reactivar"    @click="reactivar(d)">↺</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CARDS MÓVIL -->
    <div v-if="!cargando && !error && docentesFiltrados.length" class="cards-movil">
      <div v-for="d in docentesFiltrados" :key="d.id" class="doc-card" :class="{ inactivo: !d.activo }">
        <div class="doc-card-top">
          <div class="doc-avatar doc-avatar-lg">{{ iniciales(d.nombre) }}</div>
          <div class="doc-card-info">
            <p class="doc-nombre">{{ d.nombre }}</p>
            <p class="td-muted td-small">{{ d.email }}</p>
          </div>
          <span class="badge" :class="d.activo ? 'badge-green' : 'badge-gray'">
            {{ d.activo ? 'Activo' : 'Inactivo' }}
          </span>
        </div>
        <div class="doc-card-footer">
          <span class="td-muted td-small">Alta: {{ formatFecha(d.created_at) }}</span>
          <div class="acciones">
            <button class="btn-icon" @click="abrirModal(d)">✏</button>
            <button class="btn-icon btn-icon-warn" @click="abrirCambioPass(d)"></button>
            <button v-if="d.activo"  class="btn-icon btn-icon-danger"  @click="confirmarEliminar(d)">✕</button>
            <button v-else           class="btn-icon btn-icon-success" @click="reactivar(d)">↺</button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!cargando && !error && docentes.length" class="counter">
      {{ docentesFiltrados.length }} de {{ docentes.length }} docente{{ docentes.length !== 1 ? 's' : '' }}
    </p>

    <!-- ===== MODAL CREAR / EDITAR ===== -->
    <Teleport to="body">
      <div v-if="modal.abierto" class="overlay" @click.self="cerrarModal">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3>{{ modal.docente ? 'Editar docente' : 'Nuevo docente' }}</h3>
            <button class="modal-close" @click="cerrarModal">✕</button>
          </div>
          <form @submit.prevent="guardar" novalidate class="modal-body">
            <div class="mfield">
              <label>Nombre completo <span class="req">*</span></label>
              <input v-model="form.nombre" type="text" placeholder="Ej. Lirio Ruiz García"
                :class="{ merr: errores.nombre }" @blur="vNombre" />
              <span v-if="errores.nombre" class="merr-msg">{{ errores.nombre }}</span>
            </div>
            <div class="mfield">
              <label>Correo institucional <span class="req">*</span></label>
              <input v-model="form.email" type="email" placeholder="usuario@unsis.edu.mx"
                :class="{ merr: errores.email }" @blur="vEmail" />
              <span v-if="errores.email" class="merr-msg">{{ errores.email }}</span>
            </div>
            <div v-if="!modal.docente" class="mfield">
              <label>Contraseña temporal <span class="req">*</span></label>
              <div class="pass-wrap" :class="{ merr: errores.password }">
                <input v-model="form.password" :type="verPass ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres" @blur="vPassword" />
                <button type="button" class="toggle-vis" @click="verPass = !verPass">{{ verPass ? 'Ocultar' : 'Mostrar' }}</button>
              </div>
              <span v-if="errores.password" class="merr-msg">{{ errores.password }}</span>
            </div>
            <div v-if="errorModal" class="merror-banner">⚠ {{ errorModal }}</div>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="guardando">
                {{ guardando ? 'Guardando…' : modal.docente ? 'Guardar cambios' : 'Crear docente' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ===== MODAL CAMBIO DE CONTRASEÑA ===== -->
    <Teleport to="body">
      <div v-if="modalPass.abierto" class="overlay" @click.self="cerrarModalPass">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h3>Cambiar contraseña</h3>
            <button class="modal-close" @click="cerrarModalPass">✕</button>
          </div>
          <form @submit.prevent="guardarPass" novalidate class="modal-body">
            <p class="minfo">Docente: <strong>{{ modalPass.docente?.nombre }}</strong></p>
            <div class="mfield">
              <label>Nueva contraseña <span class="req">*</span></label>
              <div class="pass-wrap" :class="{ merr: erroresPass.password }">
                <input v-model="formPass.password" :type="verPass2 ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" />
                <button type="button" class="toggle-vis" @click="verPass2 = !verPass2">{{ verPass2 ? 'Ocultar' : 'Mostrar' }}</button>
              </div>
              <span v-if="erroresPass.password" class="merr-msg">{{ erroresPass.password }}</span>
            </div>
            <div v-if="errorModalPass" class="merror-banner">⚠ {{ errorModalPass }}</div>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="cerrarModalPass">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="guardandoPass">
                {{ guardandoPass ? 'Guardando…' : 'Cambiar contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ===== MODAL CONFIRMAR DESACTIVAR ===== -->
    <Teleport to="body">
      <div v-if="modalEliminar.abierto" class="overlay" @click.self="modalEliminar.abierto = false">
        <div class="modal modal-sm" role="alertdialog" aria-modal="true">
          <div class="modal-header modal-header-danger">
            <h3>Desactivar docente</h3>
            <button class="modal-close" @click="modalEliminar.abierto = false">✕</button>
          </div>
          <div class="modal-body">
            <p>¿Deseas desactivar a <strong>{{ modalEliminar.docente?.nombre }}</strong>?</p>
            <p class="mhint">El docente no podrá iniciar sesión pero sus avances se conservarán. Puedes reactivarlo en cualquier momento.</p>
            <div v-if="errorEliminar" class="merror-banner">⚠ {{ errorEliminar }}</div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="modalEliminar.abierto = false">Cancelar</button>
              <button class="btn-danger" :disabled="eliminando" @click="ejecutarEliminar">
                {{ eliminando ? 'Desactivando…' : 'Sí, desactivar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- TOAST -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.visible" class="toast" :class="`toast-${toast.tipo}`" role="status">
          {{ toast.mensaje }}
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../services/api.js'

const docentes     = ref([])
const cargando     = ref(false)
const error        = ref(null)
const busqueda     = ref('')
const filtroActivo = ref('todos')
const filtros      = [
  { val: 'todos',     label: 'Todos' },
  { val: 'activos',   label: 'Activos' },
  { val: 'inactivos', label: 'Inactivos' },
]

const docentesFiltrados = computed(() => {
  let lista = docentes.value
  if (filtroActivo.value === 'activos')   lista = lista.filter(d => d.activo)
  if (filtroActivo.value === 'inactivos') lista = lista.filter(d => !d.activo)
  const q = busqueda.value.toLowerCase().trim()
  if (q) lista = lista.filter(d => d.nombre.toLowerCase().includes(q) || d.email.toLowerCase().includes(q))
  return lista
})

// ── Modal crear/editar
const modal      = reactive({ abierto: false, docente: null })
const form       = reactive({ nombre: '', email: '', password: '' })
const errores    = reactive({})
const guardando  = ref(false)
const errorModal = ref(null)
const verPass    = ref(false)

function abrirModal(doc = null) {
  modal.docente = doc; modal.abierto = true
  errorModal.value = null; verPass.value = false
  form.nombre = doc?.nombre || ''; form.email = doc?.email || ''; form.password = ''
  Object.keys(errores).forEach(k => delete errores[k])
}
function cerrarModal() { modal.abierto = false }

function vNombre()   { form.nombre.trim()   ? delete errores.nombre   : (errores.nombre   = 'El nombre es obligatorio') }
function vEmail()    {
  if (!form.email.trim())                { errores.email = 'El correo es obligatorio'; return }
  if (!/\S+@\S+\.\S+/.test(form.email)) { errores.email = 'Correo inválido'; return }
  delete errores.email
}
function vPassword() { form.password.length >= 6 ? delete errores.password : (errores.password = 'Mínimo 6 caracteres') }

async function guardar() {
  vNombre(); vEmail(); if (!modal.docente) vPassword()
  if (Object.keys(errores).filter(k => errores[k]).length) return
  errorModal.value = null; guardando.value = true
  try {
    const payload = { nombre: form.nombre, email: form.email }
    if (!modal.docente) payload.password = form.password
    if (modal.docente) {
      await api.put(`/docentes/${modal.docente.id}`, payload)
      mostrarToast('Docente actualizado correctamente', 'success')
    } else {
      await api.post('/docentes', payload)
      mostrarToast('Docente creado correctamente', 'success')
    }
    cerrarModal(); cargar()
  } catch (err) {
    errorModal.value = err.response?.data?.error || 'Error al guardar'
  } finally { guardando.value = false }
}

// ── Modal cambio de contraseña
const modalPass      = reactive({ abierto: false, docente: null })
const formPass       = reactive({ password: '' })
const erroresPass    = reactive({})
const guardandoPass  = ref(false)
const errorModalPass = ref(null)
const verPass2       = ref(false)

function abrirCambioPass(doc) {
  modalPass.docente = doc; modalPass.abierto = true
  errorModalPass.value = null; formPass.password = ''; delete erroresPass.password; verPass2.value = false
}
function cerrarModalPass() { modalPass.abierto = false }

async function guardarPass() {
  if (formPass.password.length < 6) { erroresPass.password = 'Mínimo 6 caracteres'; return }
  delete erroresPass.password; errorModalPass.value = null; guardandoPass.value = true
  try {
    await api.put(`/docentes/${modalPass.docente.id}`, { password: formPass.password })
    mostrarToast('Contraseña actualizada correctamente', 'success'); cerrarModalPass()
  } catch (err) {
    errorModalPass.value = err.response?.data?.error || 'Error al cambiar contraseña'
  } finally { guardandoPass.value = false }
}

// ── Modal desactivar
const modalEliminar = reactive({ abierto: false, docente: null })
const eliminando    = ref(false)
const errorEliminar = ref(null)

function confirmarEliminar(doc) { modalEliminar.docente = doc; modalEliminar.abierto = true; errorEliminar.value = null }

async function ejecutarEliminar() {
  eliminando.value = true; errorEliminar.value = null
  try {
    await api.delete(`/docentes/${modalEliminar.docente.id}`)
    mostrarToast(`"${modalEliminar.docente.nombre}" desactivado`, 'info')
    modalEliminar.abierto = false; cargar()
  } catch (err) {
    errorEliminar.value = err.response?.data?.error || 'Error al desactivar'
  } finally { eliminando.value = false }
}

async function reactivar(doc) {
  try {
    await api.put(`/docentes/${doc.id}/reactivar`)
    mostrarToast(`"${doc.nombre}" reactivado`, 'success'); cargar()
  } catch { mostrarToast('Error al reactivar docente', 'error') }
}

// ── Toast
const toast = reactive({ visible: false, mensaje: '', tipo: 'success' })
let toastTimer = null
function mostrarToast(mensaje, tipo = 'success') {
  clearTimeout(toastTimer); toast.mensaje = mensaje; toast.tipo = tipo; toast.visible = true
  toastTimer = setTimeout(() => { toast.visible = false }, 3500)
}

// ── Helpers
function iniciales(nombre) { return nombre.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase() }
function formatFecha(iso)  { return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) }

async function cargar() {
  cargando.value = true; error.value = null
  try { const { data } = await api.get('/docentes'); docentes.value = data.docentes }
  catch (err) { error.value = err.response?.data?.error || 'No se pudo cargar la lista' }
  finally { cargando.value = false }
}

onMounted(cargar)
</script>

<style scoped>
.panel { max-width: 1000px; margin: 0 auto; }

.panel-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap;
}
.panel-title { font-size: 1.25rem; font-weight: 700; }
.panel-sub   { font-size: 0.82rem; color: var(--gray-500); margin-top: 2px; }

.filtros { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 1rem; }
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  background: var(--white); padding: 0 12px; flex: 1; min-width: 180px;
}
.search-wrap:focus-within { border-color: var(--primary); }
.search-icon  { color: var(--gray-400); font-size: 0.9rem; }
.search-input { border: none; outline: none; padding: 8px 0; font-size: 0.88rem; width: 100%; background: transparent; }
.filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.fchip {
  padding: 5px 14px; border: 1.5px solid var(--gray-200); border-radius: 99px;
  font-size: 0.8rem; background: var(--white); color: var(--gray-500); transition: all .15s;
}
.fchip.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); font-weight: 500; }

.estado {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 3rem; color: var(--gray-400); font-size: 0.9rem; text-align: center;
}
.estado-error { color: var(--red); }
.spinner {
  width: 28px; height: 28px;
  border: 3px solid var(--gray-200); border-top-color: var(--primary);
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* TABLA */
.table-wrap { border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); }
.tabla { width: 100%; border-collapse: collapse; background: var(--white); }
.tabla thead tr { background: var(--gray-50); }
.tabla th {
  padding: 10px 14px; font-size: 0.73rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .05em; color: var(--gray-500); text-align: left;
}
.th-right { text-align: right; }
.tabla td { padding: 12px 14px; font-size: 0.88rem; border-top: 1px solid var(--gray-100); vertical-align: middle; }
.tabla tbody tr:hover { background: var(--gray-50); }
.tabla tr.inactivo td { opacity: .55; }
.td-muted  { color: var(--gray-500); }
.td-small  { font-size: 0.8rem; }

.docente-cell { display: flex; align-items: center; gap: 10px; }
.doc-nombre   { font-weight: 500; }
.doc-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--primary-light); color: var(--primary);
  font-size: 0.72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.doc-avatar-lg { width: 40px; height: 40px; font-size: 0.85rem; }

/* CARDS MÓVIL */
.cards-movil { display: none; flex-direction: column; gap: 10px; }
.doc-card {
  background: var(--white); border: 1px solid var(--gray-200);
  border-radius: var(--radius); padding: 14px; box-shadow: var(--shadow-sm);
}
.doc-card.inactivo { opacity: .65; }
.doc-card-top  { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.doc-card-info { flex: 1; min-width: 0; }
.doc-card-info .td-small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-card-footer { display: flex; align-items: center; justify-content: space-between; }

/* BADGES */
.badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 0.74rem; font-weight: 600; white-space: nowrap; }
.badge-green { background: var(--green-bg); color: var(--green-dark); }
.badge-gray  { background: var(--gray-100); color: var(--gray-400); }

/* ACCIONES */
.acciones { display: flex; gap: 5px; justify-content: flex-end; }
.btn-icon {
  width: 30px; height: 30px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  background: var(--white); color: var(--gray-500); font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; transition: all .15s;
}
.btn-icon:hover              { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
.btn-icon-warn:hover         { border-color: var(--amber); color: var(--amber); background: #fffbeb; }
.btn-icon-danger:hover       { border-color: var(--red); color: var(--red); background: var(--red-bg); }
.btn-icon-success:hover      { border-color: var(--green-dark); color: var(--green-dark); background: var(--green-bg); }

.counter { font-size: 0.78rem; color: var(--gray-400); margin-top: 10px; }

/* OVERLAY / MODAL */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 1rem;
}
.modal {
  background: var(--white); border-radius: var(--radius-lg);
  width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-lg); animation: slideUp .2s ease;
}
.modal-sm { max-width: 380px; }
@keyframes slideUp { from { transform: translateY(14px); opacity: 0; } }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--gray-100);
}
.modal-header h3 { font-size: 1rem; font-weight: 600; }
.modal-header-danger { background: var(--red-bg); }
.modal-header-danger h3 { color: var(--red); }
.modal-close {
  width: 28px; height: 28px; border-radius: 50%; background: var(--gray-100);
  border: none; color: var(--gray-500); font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: var(--gray-200); }

.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.mfield { display: flex; flex-direction: column; gap: 5px; }
.mfield label { font-size: 0.82rem; font-weight: 500; color: var(--gray-700); }
.req { color: var(--red); margin-left: 2px; }
.mfield input {
  padding: 9px 11px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  font-size: 0.9rem; outline: none; width: 100%; transition: border-color .15s;
}
.mfield input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(103,3,0,.1); }
.mfield input.merr { border-color: var(--red); }
.merr-msg { color: var(--red); font-size: 0.76rem; }
.mhint    { font-size: 0.82rem; color: var(--gray-500); }
.minfo    { font-size: 0.88rem; color: var(--gray-700); }

.pass-wrap {
  display: flex; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  overflow: hidden; transition: border-color .15s;
}
.pass-wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(103,3,0,.1); }
.pass-wrap.merr { border-color: var(--red); }
.pass-wrap input { border: none !important; box-shadow: none !important; border-radius: 0; flex: 1; }
.toggle-vis { background: var(--gray-50); border: none; border-left: 1px solid var(--gray-200); padding: 0 12px; color: var(--gray-400); }

.merror-banner { background: var(--red-bg); border: 1px solid #fecaca; border-radius: var(--radius-sm); padding: 9px 13px; color: var(--red); font-size: 0.83rem; }
.modal-footer  { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }

/* BOTONES */
.btn-primary {
  background: var(--primary); color: white; border: none; border-radius: var(--radius-sm);
  padding: 9px 20px; font-size: 0.88rem; font-weight: 500; transition: background .15s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-ghost {
  background: var(--white); border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  padding: 9px 18px; font-size: 0.88rem; color: var(--gray-500); transition: all .15s;
}
.btn-ghost:hover { border-color: var(--gray-300); color: var(--gray-700); }
.btn-danger {
  background: var(--red); color: white; border: none; border-radius: var(--radius-sm);
  padding: 9px 20px; font-size: 0.88rem; font-weight: 500;
}
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }

/* TOAST */
.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  padding: 12px 20px; border-radius: var(--radius);
  font-size: 0.88rem; font-weight: 500; color: white;
  box-shadow: var(--shadow-lg); z-index: 300; max-width: calc(100vw - 3rem);
}
.toast-success { background: #16A34A; }
.toast-info    { background: #2563EB; }
.toast-error   { background: var(--red); }
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* RESPONSIVE */
@media (max-width: 640px) {
  .table-wrap  { display: none; }
  .cards-movil { display: flex; }
  .panel-header { flex-direction: column; align-items: stretch; }
  .panel-header .btn-primary { width: 100%; justify-content: center; }
  .filtros { flex-direction: column; align-items: stretch; }
  .filter-chips { justify-content: center; }
}
</style>
