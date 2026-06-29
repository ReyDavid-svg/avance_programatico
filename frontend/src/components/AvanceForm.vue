<template>
  <div class="wizard">

    <!-- ===== BIENVENIDA ===== -->
    <div v-if="paso === 0" class="welcome">
      <div class="welcome-icon">
            <h1>Avance Programático</h1>
      </div>
      <p class="welcome-sub">Universidad de la Sierra Sur</p>

      <div class="welcome-meta">
        <div class="meta-chip"><span class="meta-label">Año en curso</span><strong>{{year}}</strong></div>
        <div class="meta-chip"><span class="meta-label">Tiempo aproximado</span><strong>5 minutos</strong></div>
        <div class="meta-chip"><span class="meta-label">Pasos</span><strong>6 secciones</strong></div>
      </div>
      <p class="welcome-note">Completa la información de tu materia para registrar el avance del periodo.</p>
      <button class="btn-primary btn-lg" @click="paso = 1">Comenzar</button>
    </div>

    <!-- ===== WIZARD PASOS ===== -->
    <template v-else-if="paso <= 6">

      <!-- Barra de progreso -->
      <div class="progress-wrap">
        <div class="progress-header">
          <span class="progress-step">Paso {{ paso }} de 6</span>
          <span class="progress-pct">{{ Math.round((paso / 6) * 100) }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: (paso / 6 * 100) + '%' }"></div>
        </div>
        <div class="step-pills">
          <div
            v-for="s in pasos" :key="s.n"
            class="step-pill"
            :class="{ done: paso > s.n, active: paso === s.n }"
            @click="paso > s.n ? (paso = s.n) : null"
          >
            <span class="pill-icon">{{ paso > s.n ? '✓' : s.icon }}</span>
            <span class="pill-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- Dashboard card resumen (visible desde paso 2) -->
      <div v-if="paso >= 2 && form.nombreProfesor" class="summary-card">
        <div class="sum-row">
          <div><span class="sum-label">Profesor</span><strong>{{ form.nombreProfesor }}</strong></div>
          <div v-if="form.nombreMateria"><span class="sum-label">Materia</span><strong>{{ form.nombreMateria }}</strong></div>
          <div v-if="form.grupo"><span class="sum-label">Grupo</span><strong>{{ form.grupo }}</strong></div>
          <div v-if="form.numeroAvance"><span class="sum-label">Parcial</span><strong>{{ form.numeroAvance }}</strong></div>
        </div>
        <div v-if="form.porcentajeAvanceSemestre" class="sum-bar-row">
          <div class="sum-bar-track"><div class="sum-bar-fill" :style="{ width: clamp(form.porcentajeAvanceSemestre) + '%' }"></div></div>
          <span class="sum-bar-label">{{ form.porcentajeAvanceSemestre }}% avance semestre</span>
        </div>
      </div>

      <!-- PASO 1: Información general -->
      <div v-if="paso === 1" class="step-card">
        <h2 class="step-title">Información general</h2>
        <div class="grid-2">
          <div class="field">
            <label>Nombre del profesor <span class="req">*</span></label>
            <input v-model="form.nombreProfesor" type="text" placeholder="Ej. Lirio Ruiz García" :class="{ err: errores.nombreProfesor }" @blur="v('nombreProfesor')" />
            <span v-if="errores.nombreProfesor" class="err-msg">{{ errores.nombreProfesor }}</span>
          </div>
          <div class="field">
            <label>Licenciatura <span class="req">*</span></label>
            <select v-model="form.licenciatura" :class="{ err: errores.licenciatura }" @change="v('licenciatura')">
              <option value="">Selecciona</option>
              <option v-for="l in licenciaturas" :key="l" :value="l">{{ l }}</option>
            </select>
            <span v-if="errores.licenciatura" class="err-msg">{{ errores.licenciatura }}</span>
          </div>
          <div class="field">
            <label>Materia <span class="req">*</span></label>
            <input v-model="form.nombreMateria" type="text" placeholder="Ej. Cómputo Móvil" :class="{ err: errores.nombreMateria }" @blur="v('nombreMateria')" />
            <span v-if="errores.nombreMateria" class="err-msg">{{ errores.nombreMateria }}</span>
          </div>
          <div class="field">
            <label>Grupo <span class="req">*</span></label>
            <select v-model="form.grupo" :class="{ err: errores.grupo }" @change="v('grupo')">
              <option value="">Selecciona</option>
              <option v-for="g in grupos" :key="g" :value="g">{{ g }}</option>
            </select>
            <span v-if="errores.grupo" class="err-msg">{{ errores.grupo }}</span>
          </div>
        </div>
        <div class="field mt">
          <label>Número de avance <span class="req">*</span></label>
          <div class="chip-group">
            <button
              v-for="op in opcionesAvance" :key="op" type="button"
              class="chip" :class="{ 'chip-active': form.numeroAvance === op }"
              @click="form.numeroAvance = op; v('numeroAvance')"
            >{{ op }}</button>
          </div>
          <span v-if="errores.numeroAvance" class="err-msg">{{ errores.numeroAvance }}</span>
        </div>
      </div>

      <!-- PASO 2: Avance académico -->
      <div v-if="paso === 2" class="step-card">
        <h2 class="step-title">Avance académico</h2>

        <div class="info-banner">
          <span class="info-icon">ⓘ</span>
          <div>
            <strong>Cálculo automático:</strong> ingresa las horas efectivas y las horas totales de tu materia; el sistema calculará el porcentaje de avance del semestre.
          </div>
        </div>

        <div class="grid-2">
          <div class="field">
            <label>Horas totales de la materia <span class="req">*</span></label>
            <input v-model.number="form.horasTotales" type="number" min="1" placeholder="Ej. 64" @input="calcularPorcentajes" />
          </div>
          <div class="field">
            <label>Horas efectivas impartidas <span class="req">*</span></label>
            <input v-model.number="form.horasEfectivas" type="number" min="0" placeholder="Ej. 32" :class="{ err: errores.horasEfectivas }" @input="calcularPorcentajes" @blur="v('horasEfectivas')" />
            <span v-if="errores.horasEfectivas" class="err-msg">{{ errores.horasEfectivas }}</span>
          </div>
        </div>

        <!-- Tarjetas de avance -->
        <div class="avance-cards">
          <div class="avance-card">
            <span class="avance-card-label">Avance semestre</span>
            <div class="avance-card-value">{{ form.porcentajeAvanceSemestre || '—' }}<span v-if="form.porcentajeAvanceSemestre">%</span></div>
            <div class="mini-bar"><div class="mini-fill" :style="{ width: clamp(form.porcentajeAvanceSemestre) + '%', background: '#670300' }"></div></div>
            <span class="avance-card-note">Calculado automáticamente</span>
          </div>
          <div class="avance-card">
            <span class="avance-card-label">Avance programa <span class="req">*</span></span>
            <div class="avance-num-input">
              <input v-model.number="form.porcentajeAvancePrograma" type="number" min="0" max="100" placeholder="0" :class="{ err: errores.porcentajeAvancePrograma }" @blur="v('porcentajeAvancePrograma')" />
              <span class="sfx">%</span>
            </div>
            <div class="mini-bar"><div class="mini-fill" :style="{ width: clamp(form.porcentajeAvancePrograma) + '%', background: '#670300' }"></div></div>
            <span v-if="errores.porcentajeAvancePrograma" class="err-msg">{{ errores.porcentajeAvancePrograma }}</span>
          </div>
          <div class="avance-card">
            <span class="avance-card-label">Avance proyecto</span>
            <div class="avance-num-input">
              <select v-model="form.porcentajeAvanceProyecto">
                <option value="No aplica">No aplica</option>
                <option v-for="n in rango100" :key="n" :value="String(n)">{{ n }}%</option>
              </select>
            </div>
            <div class="mini-bar" v-if="form.porcentajeAvanceProyecto !== 'No aplica'"><div class="mini-fill" :style="{ width: clamp(form.porcentajeAvanceProyecto) + '%', background: '#670300' }"></div></div>
          </div>
        </div>
      </div>

      <!-- PASO 3: Rendimiento del grupo -->
      <div v-if="paso === 3" class="step-card">
        <h2 class="step-title">Rendimiento del grupo</h2>
        <div class="grid-2">
          <div class="field">
            <label>Promedio general <span class="req">*</span></label>
            <input v-model="form.promedioGrupo" type="text" placeholder="Ej. 7.5" :class="{ err: errores.promedioGrupo }" @blur="v('promedioGrupo')" />
            <span v-if="errores.promedioGrupo" class="err-msg">{{ errores.promedioGrupo }}</span>
          </div>
          <div class="field">
            <label>Promedio aprobados</label>
            <input v-model="form.promedioAprobados" type="text" placeholder="Ej. 8.9 o No aplica" />
          </div>
          <div class="field">
            <label>Promedio reprobados</label>
            <input v-model="form.promedioReprobados" type="text" placeholder="Ej. 5.8 o No aplica" />
          </div>
          <div class="field">
            <label>% de reprobados</label>
            <div class="avance-num-input">
              <select v-model="form.porcentajeReprobados">
                <option value="No aplica">No aplica</option>
                <option v-for="n in rango100" :key="n" :value="String(n)">{{ n }}%</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 4: Actividades -->
      <div v-if="paso === 4" class="step-card">
        <h2 class="step-title">Actividades realizadas</h2>

        <div class="field">
          <label>Temas vistos en el parcial <span class="req">*</span></label>
          <textarea v-model="form.temaVistos" rows="4" placeholder="Puedes copiar directamente de tu planeación académica..." :class="{ err: errores.temaVistos }" @blur="v('temaVistos')"></textarea>
          <span v-if="errores.temaVistos" class="err-msg">{{ errores.temaVistos }}</span>
        </div>

        <div class="field">
          <label>Recursos adicionales <span class="req">*</span></label>
          <input v-model="form.recursosAdicionales" type="text" placeholder="Ej. Diapositivas con audio, videos de YouTube..." :class="{ err: errores.recursosAdicionales }" @blur="v('recursosAdicionales')" />
          <span v-if="errores.recursosAdicionales" class="err-msg">{{ errores.recursosAdicionales }}</span>
        </div>

        <div class="field">
          <label>Herramientas de la plataforma</label>
          <div class="check-cards">
            <label v-for="h in herramientasOpciones" :key="h" class="check-card" :class="{ 'check-card-on': form.herramientasPlataforma.includes(h) }">
              <input type="checkbox" :value="h" v-model="form.herramientasPlataforma" />
              <span class="check-icon">{{ form.herramientasPlataforma.includes(h) ? '☑' : '☐' }}</span>
              {{ h }}
            </label>
          </div>
        </div>

        <div class="field">
          <label>¿Impartiste asesorías en este periodo? <span class="req">*</span></label>
          <div class="chip-group">
            <button type="button" class="chip" :class="{ 'chip-active': form.tieneAsesorias === true }" @click="form.tieneAsesorias = true">Sí</button>
            <button type="button" class="chip" :class="{ 'chip-active': form.tieneAsesorias === false }" @click="form.tieneAsesorias = false; form.recursosAsesorias = []; form.materiasAsesorias = ''">No</button>
          </div>
          <span v-if="errores.tieneAsesorias" class="err-msg">{{ errores.tieneAsesorias }}</span>
        </div>

        <template v-if="form.tieneAsesorias">
          <div class="field">
            <label>Recursos usados en asesorías</label>
            <div class="check-cards">
              <label v-for="r in recursosAsesoriasOpciones" :key="r" class="check-card" :class="{ 'check-card-on': form.recursosAsesorias.includes(r) }">
                <input type="checkbox" :value="r" v-model="form.recursosAsesorias" />
                <span class="check-icon">{{ form.recursosAsesorias.includes(r) ? '☑' : '☐' }}</span>
                {{ r }}
              </label>
            </div>
          </div>
          <div class="field">
            <label>Materias en las que brindó asesoría</label>
            <input v-model="form.materiasAsesorias" type="text" placeholder="Ej. Cómputo Móvil, Bases de Datos" />
          </div>
        </template>
      </div>

      <!-- PASO 5: Observaciones -->
      <div v-if="paso === 5" class="step-card">
        <h2 class="step-title">Observaciones</h2>
        <div class="field">
          <label>Observaciones generales del grupo <span class="req">*</span></label>
          <textarea
            v-model="form.observaciones"
            rows="7"
            placeholder="Describe el desempeño del grupo, estrategias usadas, aspectos a mejorar..."
            :class="{ err: errores.observaciones }"
            @blur="v('observaciones')"
            maxlength="1000"
          ></textarea>
          <div class="char-count">{{ form.observaciones.length }} / 1000 caracteres</div>
          <span v-if="errores.observaciones" class="err-msg">{{ errores.observaciones }}</span>
        </div>
      </div>

      <!-- PASO 6: Archivos -->
      <div v-if="paso === 6" class="step-card">
        <h2 class="step-title">Documentos adjuntos</h2>
        <p class="step-note">
          Nombra los archivos: <code>Gpo_Asistencia_Materia</code> — Ej. <code>1006_Asistencia_ComputoMovil</code><br>
          Formatos válidos: PDF, XLS, XLSX, ODS, JPEG · Máx. 5 MB
        </p>
        <div class="file-cards">
          <div class="file-card">
            <p class="file-card-title">Lista de asistencia</p>
            <p class="file-card-sub">Con firma autógrafa del grupo</p>
            <FileUpload field="listaAsistencia" @file-selected="(f) => archivos.listaAsistencia = f" />
          </div>
          <div class="file-card" v-if="form.tieneAsesorias">
            <p class="file-card-title">Reporte de asesorías</p>
            <p class="file-card-sub">Evidencia del periodo de asesorías</p>
            <FileUpload field="reporteAsesorias" @file-selected="(f) => archivos.reporteAsesorias = f" />
          </div>
        </div>
      </div>

      <!-- Navegación -->
      <div class="nav-row">
        <button type="button" class="btn-ghost" @click="retroceder">Anterior</button>
        <div class="nav-right">
          <button v-if="paso < 6" type="button" class="btn-primary" @click="avanzar">Siguiente</button>
          <button v-else type="button" class="btn-success" :disabled="enviando" @click="enviar">
            <span v-if="enviando">Enviando…</span>
            <span v-else>✓ Enviar avance</span>
          </button>
        </div>
      </div>

      <div v-if="errorServidor" class="server-error">{{ errorServidor }}</div>
    </template>

    <!-- ===== CONFIRMACIÓN ===== -->
    <div v-else class="confirm">
      <div class="confirm-check">✓</div>
      <h2>Avance registrado</h2>
      <p>Su información fue registrada correctamente.</p>
      <div class="folio-badge">Folio {{ folio }}</div>
      <div class="confirm-data">
        <div><span>Profesor</span><strong>{{ form.nombreProfesor }}</strong></div>
        <div><span>Materia</span><strong>{{ form.nombreMateria }}</strong></div>
        <div><span>Grupo</span><strong>{{ form.grupo }}</strong></div>
        <div><span>Parcial</span><strong>{{ form.numeroAvance }}</strong></div>
        <div><span>Avance semestre</span><strong>{{ form.porcentajeAvanceSemestre }}%</strong></div>
      </div>
      <button class="btn-ghost mt" @click="resetear">Registrar otro avance</button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '../services/api.js'
import FileUpload from './FileUpload.vue'

const licenciaturas = [
  'Licenciatura en Administración Municipal',
  'Licenciatura en Enfermería',
  'Licenciatura en Ciencias Empresariales',
  'Licenciatura en Administración Pública',
  'Licenciatura en Informática',
  'Licenciatura en Nutrición',
  'Licenciatura en Odontología',
  'Licenciatura en Medicina',
  'Licenciatura en Ciencias Biomédicas',
  'División de Estudios de Posgrado',
]
const opcionesAvance = ['Parcial 1', 'Parcial 2', 'Parcial 3', 'Ordinario']
const grupos = ['601','801','1001','203-A','203-B','203-C','203-D','203-E','203-F','203-G','203-H','203-I','403-A','403-B','403-C','403-D','403-E','403-F','603-A','603-B','603-C','603-D','803-A','803-B','803-C','1003-A','1003-B','1003-C','204-A','204-B','404','604','804','1004','205','405','605','805','1005','206-A','206-B','406','606','806','1006','207-A','207-B','407','607','807','1007','208','408-A','408-B','209','409','410','211','611','213-A','213-B','213-C','213-D','213-E','213-F','213-G','213-H','213-I','413-A','413-B','413-C','413-D','613-A','613-B','613-C','613-D','813-A','813-B','813-C','1013-A','1013-B','1013-C','214-A','214-B','214-C','214-D','414-A','414-B','414-C','614-A','614-B','614-C','814-A','814-B','1014-A','1014-B','1014-C','1214-A','1214-B','1214-C','216-A','216-B','216-C','416']
const herramientasOpciones = ['Chat', 'Foro', 'Videollamadas', 'Otro']
const recursosAsesoriasOpciones = ['Chat', 'Foro', 'Mensajería privada', 'Otro']
const rango100 = Array.from({ length: 100 }, (_, i) => i + 1)

const pasos = [
  { n: 1, icon: '1', label: 'General' },
  { n: 2, icon: '2', label: 'Avance' },
  { n: 3, icon: '3', label: 'Calificaciones' },
  { n: 4, icon: '4', label: 'Actividades' },
  { n: 5, icon: '5', label: 'Observaciones' },
  { n: 6, icon: '6', label: 'Archivos' },
]

const paso = ref(0)
const enviando = ref(false)
const errorServidor = ref(null)
const year = new Date().getFullYear()
const folio = ref('')

const form = reactive({
  nombreProfesor: '', licenciatura: '', nombreMateria: '', grupo: '', numeroAvance: '',
  horasTotales: '', horasEfectivas: '',
  porcentajeAvanceSemestre: '', porcentajeAvancePrograma: '', porcentajeAvanceProyecto: 'No aplica',
  promedioGrupo: '', promedioAprobados: '', promedioReprobados: '', porcentajeReprobados: 'No aplica',
  temaVistos: '', herramientasPlataforma: [], recursosAdicionales: '',
  tieneAsesorias: null, recursosAsesorias: [], materiasAsesorias: '',
  observaciones: '',
})

const archivos = reactive({ listaAsistencia: null, reporteAsesorias: null })
const errores = reactive({})

function clamp(v) { return Math.min(Math.max(Number(v) || 0, 0), 100) }

function calcularPorcentajes() {
  if (form.horasTotales > 0 && form.horasEfectivas >= 0) {
    form.porcentajeAvanceSemestre = Math.round((form.horasEfectivas / form.horasTotales) * 100)
  } else {
    form.porcentajeAvanceSemestre = ''
  }
}

const reglas = {
  nombreProfesor: v => v.trim() ? null : 'El nombre del profesor es obligatorio',
  licenciatura:   v => v ? null : 'Selecciona una licenciatura',
  nombreMateria:  v => v.trim() ? null : 'El nombre de la materia es obligatorio',
  grupo:          v => v ? null : 'Selecciona un grupo',
  numeroAvance:   v => v ? null : 'Selecciona el número de avance',
  horasEfectivas: v => (v !== '' && v >= 0) ? null : 'Ingresa las horas efectivas',
  porcentajeAvancePrograma: v => (v !== '' && v >= 0 && v <= 100) ? null : 'Ingresa un valor entre 0 y 100',
  promedioGrupo:  v => v.trim() ? null : 'El promedio del grupo es obligatorio',
  temaVistos:     v => v.trim() ? null : 'Describe los temas vistos',
  recursosAdicionales: v => v.trim() ? null : 'Indica los recursos utilizados',
  tieneAsesorias: v => v !== null ? null : 'Indica si impartiste asesorías',
  observaciones:  v => v.trim() ? null : 'Agrega observaciones del grupo',
}

const camposPorPaso = {
  1: ['nombreProfesor', 'licenciatura', 'nombreMateria', 'grupo', 'numeroAvance'],
  2: ['horasEfectivas', 'porcentajeAvancePrograma'],
  3: ['promedioGrupo'],
  4: ['temaVistos', 'recursosAdicionales', 'tieneAsesorias'],
  5: ['observaciones'],
}

function v(campo) {
  const r = reglas[campo]
  if (!r) return true
  const e = r(form[campo])
  if (e) { errores[campo] = e; return false }
  delete errores[campo]; return true
}

function validarPaso(p) {
  const campos = camposPorPaso[p] || []
  return campos.every(c => v(c))
}

function avanzar() {
  if (validarPaso(paso.value)) paso.value++
}

function retroceder() {
  if (paso.value > 1) paso.value--
  else paso.value = 0
}

async function enviar() {
  errorServidor.value = null
  enviando.value = true
  try {
    const data = new FormData()
    Object.entries(form).forEach(([k, val]) => {
      if (Array.isArray(val)) val.forEach(item => data.append(k, item))
      else data.append(k, val)
    })
    if (archivos.listaAsistencia) data.append('listaAsistencia', archivos.listaAsistencia)
    if (archivos.reporteAsesorias) data.append('reporteAsesorias', archivos.reporteAsesorias)

    const res = await api.post('/avances', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    folio.value = `AP-2026-${String(res.data.avance?.id || 1).padStart(3, '0')}`
    paso.value = 7
  } catch (err) {
    errorServidor.value = err.response?.data?.errores?.[0]?.msg || 'Verifica tu conexión e intenta de nuevo.'
  } finally {
    enviando.value = false
  }
}

function resetear() {
  Object.keys(form).forEach(k => {
    if (Array.isArray(form[k])) form[k] = []
    else if (['porcentajeAvanceProyecto','porcentajeReprobados'].includes(k)) form[k] = 'No aplica'
    else if (k === 'tieneAsesorias') form[k] = null
    else form[k] = ''
  })
  archivos.listaAsistencia = null; archivos.reporteAsesorias = null
  Object.keys(errores).forEach(k => delete errores[k])
  paso.value = 0
}
</script>

<style scoped>
.wizard { max-width: 700px; margin: 0 auto; }

/* BIENVENIDA */
.welcome {
  background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--gray-200);
  padding: 3rem 2rem; text-align: center; box-shadow: var(--shadow);
}
.welcome-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
.welcome h1 { font-size: 1.8rem; color: var(--gray-900); margin-bottom: 4px; }
.welcome-sub { color: var(--gray-500); font-size: 0.9rem; margin-bottom: 1.5rem; }
.welcome-meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 1.5rem; }
.meta-chip {
  display: flex; flex-direction: column; align-items: center;
  background: var(--gray-50); border: 1px solid var(--gray-200);
  border-radius: var(--radius); padding: 10px 18px; min-width: 120px;
}
.meta-label { font-size: 0.72rem; color: var(--gray-400); text-transform: uppercase; letter-spacing: .05em; }
.meta-chip strong { font-size: 0.95rem; color: var(--gray-900); margin-top: 2px; }
.welcome-note { color: var(--gray-500); font-size: 0.85rem; max-width: 380px; margin: 0 auto 1.5rem; }

/* PROGRESO */
.progress-wrap { margin-bottom: 1.25rem; }
.progress-header { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--gray-500); margin-bottom: 6px; }
.progress-pct { font-weight: 600; color: var(--primary); }
.progress-track { height: 6px; background: var(--gray-200); border-radius: 99px; overflow: hidden; margin-bottom: 12px; }
.progress-fill { height: 100%; background: var(--primary); border-radius: 99px; transition: width .4s ease; }
.step-pills { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; }
.step-pill {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--gray-200);
  font-size: 0.72rem; color: var(--gray-400); background: var(--white); min-width: 70px;
  transition: all .2s; white-space: nowrap;
}
.step-pill.done { background: var(--primary-mid); border-color: var(--primary); color: var(--primary); cursor: pointer; }
.step-pill.active { background: var(--primary); border-color: var(--primary); color: white; }
.pill-icon { font-size: 1rem; }
.pill-label { font-size: 0.68rem; }

/* SUMMARY CARD */
.summary-card {
  background: var(--primary); color: white; border-radius: var(--radius);
  padding: 12px 16px; margin-bottom: 1rem;
}
.sum-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 8px; }
.sum-row div { display: flex; flex-direction: column; }
.sum-label { font-size: 0.68rem; opacity: .65; text-transform: uppercase; letter-spacing: .04em; }
.sum-row strong { font-size: 0.88rem; }
.sum-bar-row { display: flex; align-items: center; gap: 10px; }
.sum-bar-track { flex: 1; height: 5px; background: rgba(255,255,255,0.25); border-radius: 99px; overflow: hidden; }
.sum-bar-fill { height: 100%; background: #ffdbdb; border-radius: 99px; transition: width .4s ease; }
.sum-bar-label { font-size: 0.78rem; opacity: .85; white-space: nowrap; }

/* STEP CARD */
.step-card {
  background: var(--white); border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm);
  margin-bottom: 1rem;
}
.step-title { font-size: 1.15rem; font-weight: 600; color: var(--gray-900); margin-bottom: 1.25rem; }
.step-note { font-size: 0.8rem; color: var(--gray-500); margin-bottom: 1.25rem; line-height: 1.6; }
.step-note code { background: var(--gray-100); padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }

/* GRID */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 520px) { .grid-2 { grid-template-columns: 1fr; } }

/* FIELDS */
.field { display: flex; flex-direction: column; gap: 5px; }
.field.mt { margin-top: 1rem; }
.field label { font-size: 0.82rem; font-weight: 500; color: var(--gray-700); }
.req { color: var(--red); margin-left: 2px; }
.err-msg { color: var(--red); font-size: 0.76rem; }
.char-count { font-size: 0.75rem; color: var(--gray-400); text-align: right; }

input, select, textarea {
  padding: 9px 11px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  font-size: 0.9rem; background: var(--white); color: var(--gray-900);
  transition: border-color .15s; outline: none; width: 100%;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(103,3,0,0.1);
}
.err { border-color: var(--red) !important; }

/* CHIP GROUP */
.chip-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
.chip {
  padding: 7px 18px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  background: var(--white); font-size: 0.88rem; color: var(--gray-700); transition: all .15s;
}
.chip:hover { border-color: var(--primary); }
.chip-active { background: var(--primary-light); border-color: var(--primary); color: var(--primary); font-weight: 500; }

/* CHECK CARDS */
.check-cards { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.check-card {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm);
  font-size: 0.86rem; cursor: pointer; background: var(--white); transition: all .15s;
}
.check-card input { display: none; }
.check-card:hover { border-color: var(--primary); }
.check-card-on { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
.check-icon { font-size: 1.05rem; }

/* AVANCE CARDS */
.avance-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.25rem; }
@media (max-width: 520px) { .avance-cards { grid-template-columns: 1fr; } }
.avance-card {
  border: 1.5px solid var(--gray-200); border-radius: var(--radius);
  padding: 14px; display: flex; flex-direction: column; gap: 8px; background: var(--gray-50);
}
.avance-card-label { font-size: 0.78rem; color: var(--gray-500); font-weight: 500; }
.avance-card-value { font-size: 2rem; font-weight: 700; color: var(--primary); font-family: 'Outfit',sans-serif; line-height: 1; }
.avance-card-note { font-size: 0.7rem; color: var(--gray-400); }
.avance-num-input { display: flex; align-items: stretch; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm); overflow: hidden; background: var(--white); }
.avance-num-input input, .avance-num-input select { border: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 7px 8px; }
.sfx { padding: 0 10px; background: var(--gray-100); color: var(--gray-500); display: flex; align-items: center; font-size: 0.85rem; border-left: 1px solid var(--gray-200); }
.mini-bar { height: 5px; background: var(--gray-200); border-radius: 99px; overflow: hidden; }
.mini-fill { height: 100%; border-radius: 99px; transition: width .4s ease; }

/* INFO BANNER */
.info-banner {
  display: flex; gap: 10px; align-items: flex-start;
  background: var(--primary-light); border: 1px solid var(--blue-mid); border-radius: var(--radius-sm);
  padding: 10px 14px; font-size: 0.83rem; color: var(--gray-700); margin-bottom: 1.25rem;
}
.info-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }

/* FILE CARDS */
.file-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 520px) { .file-cards { grid-template-columns: 1fr; } }
.file-card { border: 1.5px solid var(--gray-200); border-radius: var(--radius); padding: 16px; background: var(--gray-50); }
.file-card-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 2px; }
.file-card-sub { font-size: 0.76rem; color: var(--gray-400); margin-bottom: 12px; }

/* NAVEGACIÓN */
.nav-row { display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0 0.5rem; }
.nav-right { display: flex; gap: 10px; }

.btn-primary { background: var(--primary); color: white; border: none; border-radius: var(--radius-sm); padding: 10px 24px; font-weight: 500; font-size: 0.9rem; transition: background .15s; }
.btn-primary:hover { background: var(--blue-dark); }
.btn-success { background: #16A34A; color: white; border: none; border-radius: var(--radius-sm); padding: 10px 24px; font-weight: 500; font-size: 0.9rem; transition: background .15s; }
.btn-success:hover { background: #15803D; }
.btn-success:disabled { opacity: .6; cursor: not-allowed; }
.btn-ghost { background: none; border: 1.5px solid var(--gray-200); border-radius: var(--radius-sm); padding: 10px 20px; font-size: 0.9rem; color: var(--gray-500); transition: all .15s; }
.btn-ghost:hover { border-color: var(--gray-300); color: var(--gray-700); }
.btn-lg { padding: 13px 36px; font-size: 1rem; }
.mt { margin-top: 1rem; }

/* SERVER ERROR */
.server-error { background: #FEF2F2; border: 1px solid #FECACA; border-radius: var(--radius-sm); padding: 10px 14px; color: var(--red); font-size: 0.85rem; margin-top: 8px; }

/* CONFIRMACIÓN */
.confirm {
  background: var(--white); border: 1px solid var(--gray-200); border-radius: var(--radius-lg);
  padding: 3rem 2rem; text-align: center; box-shadow: var(--shadow);
}
.confirm-check {
  width: 64px; height: 64px; background: var(--green); color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 1.8rem;
  margin: 0 auto 1rem;
}
.confirm h2 { font-size: 1.5rem; margin-bottom: 6px; }
.confirm p { color: var(--gray-500); font-size: 0.9rem; margin-bottom: 1.25rem; }
.folio-badge {
  display: inline-block; background: var(--primary-light); color: var(--primary);
  border: 1px solid var(--blue-mid); border-radius: var(--radius-sm);
  padding: 8px 20px; font-family: 'Outfit',sans-serif; font-weight: 700; font-size: 1.05rem;
  margin-bottom: 1.5rem; letter-spacing: .04em;
}
.confirm-data {
  display: flex; flex-direction: column; gap: 8px; text-align: left;
  background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: var(--radius);
  padding: 16px 20px; margin-bottom: 1.25rem;
}
.confirm-data div { display: flex; justify-content: space-between; font-size: 0.88rem; gap: 1rem; }
.confirm-data span { color: var(--gray-400); }
.confirm-data strong { color: var(--gray-900); text-align: right; }
/* EXTRA MOBILE */
@media (max-width: 480px) {
  .welcome { padding: 2rem 1.25rem; }
  .welcome h1 { font-size: 1.4rem; }
  .meta-chip { min-width: 90px; padding: 8px 12px; }
  .step-card { padding: 1.25rem 1rem; }
  .nav-row { gap: 8px; }
  .btn-lg { padding: 11px 24px; }
}
</style>
