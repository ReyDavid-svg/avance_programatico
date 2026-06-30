<template>
  <div class="login-page">
    <div class="login-left">
      <div class="login-brand">
        <div>
          <p class="login-inst-full">Universidad de la Sierra Sur</p>
        </div>
      </div>

      <div class="login-hero">
        <h1>Avances<br>Programáticos</h1>
        <p>Plataforma de registro y seguimiento académico para docentes.</p>
        <div class="login-chips">
          <span class="lchip">Registro por parcial</span>
          <span class="lchip">Indicadores de avance</span>
          <span class="lchip">Adjunto de documentos</span>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <h2>Iniciar sesión</h2>
        <p class="login-sub">Accede con tu cuenta institucional</p>

        <form @submit.prevent="enviar" novalidate>
          <div class="lfield">
            <label for="email">Correo electrónico</label>
            <div class="linput-wrap" :class="{ 'linput-err': errores.email }">
              <span class="linput-icon"></span>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="usuario@unsis.edu.mx"
                autocomplete="email"
                @blur="validarEmail"
              />
            </div>
            <span v-if="errores.email" class="lerr">{{ errores.email }}</span>
          </div>

          <div class="lfield">
            <label for="password">Contraseña</label>
            <div class="linput-wrap" :class="{ 'linput-err': errores.password }">
              <span class="linput-icon"></span>
              <input
                id="password"
                v-model="form.password"
                :type="mostrarPass ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                @blur="validarPassword"
              />
              <button type="button" class="toggle-pass" @click="mostrarPass = !mostrarPass" :aria-label="mostrarPass ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                {{ mostrarPass ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <span v-if="errores.password" class="lerr">{{ errores.password }}</span>
          </div>

          <div v-if="errorServidor" class="lerror-banner">
            <span>⚠</span> {{ errorServidor }}
          </div>

          <button type="submit" class="lbtn" :disabled="cargando">
            <span v-if="cargando" class="lbtn-spin"></span>
            <span v-else>Entrar</span>
          </button>
        </form>

        <p class="login-footer-note">
          Si tienes problemas para acceder, contanta al encargado de sistemas.
          </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '../services/api.js'
import { authStore } from '../stores/auth.js'

const emit = defineEmits(['login-ok'])

const form = reactive({ email: '', password: '' })
const errores = reactive({})
const cargando = ref(false)
const errorServidor = ref(null)
const mostrarPass = ref(false)

function validarEmail() {
  if (!form.email.trim()) { errores.email = 'El correo es obligatorio'; return false }
  if (!/\S+@\S+\.\S+/.test(form.email)) { errores.email = 'Ingresa un correo válido'; return false }
  delete errores.email; return true
}

function validarPassword() {
  if (!form.password) { errores.password = 'La contraseña es obligatoria'; return false }
  delete errores.password; return true
}

async function enviar() {
  errorServidor.value = null
  const ok = validarEmail() & validarPassword()
  if (!ok) return

  cargando.value = true
  try {
    const { data } = await api.post('/auth/login', {
      email:    form.email.trim().toLowerCase(),
      password: form.password,
    })
    authStore.login(data.token, data.usuario)
    emit('login-ok')
  } catch (err) {
    errorServidor.value = err.response?.data?.error || 'Error de conexión. Intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 700px) {
  .login-page { grid-template-columns: 1fr; }
  .login-left  { display: none; }
}

/* LEFT PANEL */
.login-left {
  background: linear-gradient(160deg, #670300 0%, #3d0200 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.5rem;
  color: white;
}
.login-brand { display: flex; align-items: center; gap: 14px; }
.login-inst { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.1rem; color: #000000; line-height: 1; }
.login-inst-full { font-size: 0.72rem; color: rgba(255,255,255,0.55); }
.login-hero h1 { font-family: 'Outfit', sans-serif; font-size: 3rem; font-weight: 700; line-height: 1.1; margin-bottom: 1rem; }
.login-hero p { font-size: 1rem; color: rgba(255,255,255,0.7); max-width: 340px; margin-bottom: 2rem; }
.login-chips { display: flex; flex-direction: column; gap: 10px; }
.lchip { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 99px; padding: 6px 14px; font-size: 0.83rem; }

/* RIGHT PANEL */
.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #F5F7FA;
}
.login-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.login-card h2 { font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 4px; color: #670300; }
.login-sub { font-size: 0.85rem; color: #64748B; margin-bottom: 1.75rem; }

.lfield { display: flex; flex-direction: column; gap: 5px; margin-bottom: 1.1rem; }
.lfield label { font-size: 0.82rem; font-weight: 500; color: #334155; }

.linput-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: border-color .15s;
}
.linput-wrap:focus-within { border-color: #670300; box-shadow: 0 0 0 3px rgba(103,3,0,0.1); }
.linput-err { border-color: #EF4444 !important; }
.linput-icon { padding: 0 10px; font-size: 0.9rem; color: #94A3B8; flex-shrink: 0; }

.linput-wrap input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 4px;
  font-size: 0.9rem;
  background: transparent;
  color: #0F172A;
}
.toggle-pass { background: none; border: none; padding: 0 10px; font-size: 0.9rem; cursor: pointer; color: #94A3B8; }
.lerr { color: #EF4444; font-size: 0.76rem; }

.lerror-banner {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 10px 14px;
  color: #EF4444;
  font-size: 0.83rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lbtn {
  width: 100%;
  background: #670300;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.lbtn:hover:not(:disabled) { background: #4a0200; }
.lbtn:disabled { opacity: .6; cursor: not-allowed; }

.login-footer-note { margin-top: 1.5rem; font-size: 0.76rem; color: #94A3B8; text-align: center; }
</style>
