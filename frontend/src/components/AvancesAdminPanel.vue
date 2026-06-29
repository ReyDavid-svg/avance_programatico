<template>
  <div class="panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">Avances programáticos</h2>
        <p class="panel-sub">Registro de todos los avances enviados por los docentes</p>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="filtros">
      <div class="search-wrap">
        <span class="si">🔍</span>
        <input v-model="busqueda" type="search" placeholder="Buscar por docente, materia o grupo..." class="search-input" />
      </div>
      <select v-model="filtroParcial" class="sel-filter">
        <option value="">Todos los parciales</option>
        <option v-for="p in ['Parcial 1','Parcial 2','Parcial 3','Ordinario']" :key="p" :value="p">{{ p }}</option>
      </select>
    </div>

    <!-- ESTADO -->
    <div v-if="cargando" class="estado"><div class="spinner"></div><span>Cargando avances…</span></div>
    <div v-else-if="error" class="estado estado-error">⚠ {{ error }}</div>
    <div v-else-if="!filtrados.length" class="estado">
      <span style="font-size:2rem">📭</span>
      <p>{{ busqueda || filtroParcial ? 'Sin resultados para los filtros aplicados.' : 'Aún no hay avances registrados.' }}</p>
    </div>

    <!-- TABLA DESKTOP -->
    <div v-else class="table-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Docente</th>
            <th>Materia / Grupo</th>
            <th>Parcial</th>
            <th>% Semestre</th>
            <th>% Programa</th>
            <th>Fecha</th>
            <th>Ver</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtrados" :key="a.id">
            <td><span class="folio-badge">{{ a.folio }}</span></td>
            <td>
              <div class="docente-cell">
                <div class="doc-avatar">{{ iniciales(a.nombre_profesor) }}</div>
                <span>{{ a.nombre_profesor }}</span>
              </div>
            </td>
            <td>
              <span class="mat-nombre">{{ a.nombre_materia }}</span>
              <span class="grupo-badge">{{ a.grupo }}</span>
            </td>
            <td><span class="parcial-badge">{{ a.numero_avance }}</span></td>
            <td>
              <div class="pct-cell">
                <div class="mini-bar"><div class="mini-fill" :style="{ width: a.porcentaje_avance_semestre + '%' }"></div></div>
                <span>{{ a.porcentaje_avance_semestre }}%</span>
              </div>
            </td>
            <td>
              <div class="pct-cell">
                <div class="mini-bar"><div class="mini-fill mini-green" :style="{ width: a.porcentaje_avance_programa + '%' }"></div></div>
                <span>{{ a.porcentaje_avance_programa }}%</span>
              </div>
            </td>
            <td class="td-muted td-small">{{ formatFecha(a.created_at) }}</td>
            <td>
              <button class="btn-ver" @click="verDetalle(a)">Ver →</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CARDS MÓVIL -->
    <div v-if="!cargando && !error && filtrados.length" class="cards-movil">
      <div v-for="a in filtrados" :key="a.id" class="av-card" @click="verDetalle(a)">
        <div class="av-card-top">
          <span class="folio-badge">{{ a.folio }}</span>
          <span class="parcial-badge">{{ a.numero_avance }}</span>
        </div>
        <p class="av-card-materia">{{ a.nombre_materia }} <span class="grupo-badge">{{ a.grupo }}</span></p>
        <p class="av-card-prof td-muted td-small">{{ a.nombre_profesor }}</p>
        <div class="av-card-pcts">
          <div class="pct-cell">
            <div class="mini-bar"><div class="mini-fill" :style="{ width: a.porcentaje_avance_semestre + '%' }"></div></div>
            <span class="td-small">{{ a.porcentaje_avance_semestre }}% sem.</span>
          </div>
          <div class="pct-cell">
            <div class="mini-bar"><div class="mini-fill mini-green" :style="{ width: a.porcentaje_avance_programa + '%' }"></div></div>
            <span class="td-small">{{ a.porcentaje_avance_programa }}% prog.</span>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!cargando && !error && avances.length" class="counter">
      {{ filtrados.length }} de {{ avances.length }} avances
    </p>

    <!-- MODAL DETALLE -->
    <Teleport to="body">
      <div v-if="detalle" class="overlay" @click.self="detalle = null">
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <h3>Avance — <span class="folio-badge">{{ detalle.folio }}</span></h3>
              <p class="td-muted td-small">{{ formatFecha(detalle.created_at) }}</p>
            </div>
            <button class="modal-close" @click="detalle = null">✕</button>
          </div>
          <div class="modal-body detalle-body">
            <div class="det-grid">
              <div class="det-item"><span class="det-label">Docente</span><strong>{{ detalle.nombre_profesor }}</strong></div>
              <div class="det-item"><span class="det-label">Licenciatura</span><strong>{{ detalle.licenciatura }}</strong></div>
              <div class="det-item"><span class="det-label">Materia</span><strong>{{ detalle.nombre_materia }}</strong></div>
              <div class="det-item"><span class="det-label">Grupo</span><strong>{{ detalle.grupo }}</strong></div>
              <div class="det-item"><span class="det-label">Parcial</span><strong>{{ detalle.numero_avance }}</strong></div>
              <div class="det-item"><span class="det-label">Horas efectivas</span><strong>{{ detalle.horas_efectivas }}</strong></div>
              <div class="det-item"><span class="det-label">% Avance semestre</span>
                <strong>{{ detalle.porcentaje_avance_semestre }}%</strong></div>
              <div class="det-item"><span class="det-label">% Avance programa</span>
                <strong>{{ detalle.porcentaje_avance_programa }}%</strong></div>
              <div class="det-item"><span class="det-label">Promedio grupo</span><strong>{{ detalle.promedio_grupo }}</strong></div>
              <div class="det-item"><span class="det-label">% Reprobados</span><strong>{{ detalle.porcentaje_reprobados }}</strong></div>
              <div class="det-item det-full"><span class="det-label">Temas vistos</span><p class="det-text">{{ detalle.temas_vistos }}</p></div>
              <div class="det-item det-full"><span class="det-label">Recursos adicionales</span><p class="det-text">{{ detalle.recursos_adicionales }}</p></div>
              <div class="det-item det-full"><span class="det-label">Observaciones</span><p class="det-text">{{ detalle.observaciones }}</p></div>
              <div class="det-item"><span class="det-label">Asesorías</span><strong>{{ detalle.tiene_asesorias ? 'Sí' : 'No' }}</strong></div>
              <div v-if="detalle.lista_asistencia" class="det-item">
                <span class="det-label">Lista de asistencia</span><strong>{{ detalle.lista_asistencia }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../services/api.js'

const avances      = ref([])
const cargando     = ref(false)
const error        = ref(null)
const busqueda     = ref('')
const filtroParcial = ref('')
const detalle      = ref(null)

const filtrados = computed(() => {
  let lista = avances.value
  if (filtroParcial.value) lista = lista.filter(a => a.numero_avance === filtroParcial.value)
  const q = busqueda.value.toLowerCase().trim()
  if (q) lista = lista.filter(a =>
    a.nombre_profesor?.toLowerCase().includes(q) ||
    a.nombre_materia?.toLowerCase().includes(q) ||
    a.grupo?.toLowerCase().includes(q)
  )
  return lista
})

function verDetalle(a) { detalle.value = a }
function iniciales(n)  { return (n || '?').split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase() }
function formatFecha(iso) { return new Date(iso).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) }

async function cargar() {
  cargando.value = true; error.value = null
  try { const { data } = await api.get('/avances'); avances.value = data.avances }
  catch (err) { error.value = err.response?.data?.error || 'Error al cargar avances' }
  finally { cargando.value = false }
}
onMounted(cargar)
</script>

<style scoped>
.panel { max-width: 1000px; margin: 0 auto; }
.panel-header { margin-bottom: 1.25rem; }
.panel-title  { font-size: 1.25rem; font-weight: 700; }
.panel-sub    { font-size: 0.82rem; color: var(--gray-500); margin-top: 2px; }

.filtros { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 1rem; }
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  background: var(--white); padding: 0 12px; flex: 1; min-width: 200px;
}
.search-wrap:focus-within { border-color: var(--primary); }
.si { color: var(--gray-400); font-size: 0.9rem; }
.search-input { border: none; outline: none; padding: 8px 0; font-size: 0.88rem; width: 100%; background: transparent; }
.sel-filter {
  padding: 8px 12px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  font-size: 0.88rem; outline: none; background: var(--white);
}
.sel-filter:focus { border-color: var(--primary); }

.estado { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 3rem; color: var(--gray-400); font-size: 0.9rem; text-align: center; }
.estado-error { color: var(--red); }
.spinner { width: 28px; height: 28px; border: 3px solid var(--gray-200); border-top-color: var(--primary); border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* TABLA */
.table-wrap { border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); }
.tabla { width: 100%; border-collapse: collapse; background: var(--white); }
.tabla thead tr { background: var(--gray-50); }
.tabla th { padding: 10px 12px; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--gray-500); text-align: left; }
.tabla td { padding: 11px 12px; font-size: 0.86rem; border-top: 1px solid var(--gray-100); vertical-align: middle; }
.tabla tbody tr:hover { background: var(--gray-50); }
.td-muted { color: var(--gray-500); }
.td-small { font-size: 0.78rem; }

.docente-cell { display: flex; align-items: center; gap: 8px; }
.doc-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--primary-light); color: var(--primary);
  font-size: 0.68rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.folio-badge  { font-family: 'Outfit',sans-serif; font-weight: 700; font-size: 0.78rem; color: var(--primary); background: var(--primary-light); padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.parcial-badge { font-size: 0.75rem; background: var(--gray-100); color: var(--gray-500); padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.mat-nombre   { font-weight: 500; display: block; }
.grupo-badge  { font-size: 0.75rem; background: #eff6ff; color: #1d4ed8; padding: 1px 7px; border-radius: 4px; margin-left: 5px; white-space: nowrap; }

.pct-cell  { display: flex; align-items: center; gap: 7px; min-width: 80px; }
.mini-bar  { flex: 1; height: 5px; background: var(--gray-200); border-radius: 99px; overflow: hidden; }
.mini-fill { height: 100%; background: var(--primary); border-radius: 99px; }
.mini-green { background: #22c55e; }

.btn-ver { background: none; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm); padding: 5px 10px; font-size: 0.78rem; color: var(--gray-500); transition: all .15s; }
.btn-ver:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }

.counter { font-size: 0.78rem; color: var(--gray-400); margin-top: 10px; }

/* CARDS MÓVIL */
.cards-movil { display: none; flex-direction: column; gap: 10px; }
.av-card {
  background: var(--white); border: 1px solid var(--gray-200);
  border-radius: var(--radius); padding: 14px; box-shadow: var(--shadow-sm); cursor: pointer;
  transition: box-shadow .15s;
}
.av-card:hover { box-shadow: var(--shadow); }
.av-card-top     { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.av-card-materia { font-weight: 600; font-size: 0.9rem; margin-bottom: 2px; }
.av-card-prof    { margin-bottom: 10px; }
.av-card-pcts    { display: flex; flex-direction: column; gap: 6px; }

/* OVERLAY / MODAL */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 1rem;
}
.modal {
  background: var(--white); border-radius: var(--radius-lg);
  width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-lg); animation: slideUp .2s ease;
}
@keyframes slideUp { from { transform: translateY(14px); opacity: 0; } }
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--gray-100); gap: 12px;
}
.modal-header h3 { font-size: 1rem; font-weight: 600; }
.modal-close {
  width: 28px; height: 28px; border-radius: 50%; background: var(--gray-100);
  border: none; color: var(--gray-500); font-size: 0.8rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-close:hover { background: var(--gray-200); }
.modal-body   { padding: 20px; }
.detalle-body { padding: 16px 20px; }

.det-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.det-full  { grid-column: 1 / -1; }
.det-item  { display: flex; flex-direction: column; gap: 2px; }
.det-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: .04em; color: var(--gray-400); font-weight: 600; }
.det-item strong { font-size: 0.9rem; color: var(--gray-900); }
.det-text  { font-size: 0.86rem; color: var(--gray-700); line-height: 1.5; white-space: pre-line; }

/* RESPONSIVE */
@media (max-width: 640px) {
  .table-wrap  { display: none; }
  .cards-movil { display: flex; }
  .filtros     { flex-direction: column; }
  .det-grid    { grid-template-columns: 1fr; }
}
</style>
