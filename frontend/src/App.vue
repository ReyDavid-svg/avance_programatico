<template>
  <div class="app">

    <!-- LOGIN -->
    <LoginView v-if="!logueado" @login-ok="alLoguear" />

    <!-- APP PRINCIPAL -->
    <template v-else>
      <AppHeader
        :usuario="authStore.usuario"
        :esAdmin="authStore.esAdmin"
        :tabActivo="tabActivo"
        @logout="cerrarSesion"
        @cambiar-tab="tabActivo = $event"
      />

      <main class="main">
        <!-- ADMIN: tabs entre Avances y Docentes -->
        <template v-if="authStore.esAdmin">
          <!-- TAB: avances del sistema -->
          <div v-show="tabActivo === 'avances'">
            <AvancesAdminPanel />
          </div>
          <!-- TAB: gestión de docentes -->
          <div v-show="tabActivo === 'docentes'">
            <DocentesPanel />
          </div>
        </template>

        <!-- PROFESOR: solo el wizard de avance -->
        <template v-else>
          <AvanceForm />
        </template>
      </main>

      <AppFooter />
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authStore } from './stores/auth.js'
import LoginView        from './components/LoginView.vue'
import AppHeader        from './components/AppHeader.vue'
import AppFooter        from './components/AppFooter.vue'
import AvanceForm       from './components/AvanceForm.vue'
import DocentesPanel    from './components/DocentesPanel.vue'
import AvancesAdminPanel from './components/AvancesAdminPanel.vue'

const logueado  = ref(authStore.logueado)
const tabActivo = ref('avances')

function alLoguear() {
  logueado.value = true
  tabActivo.value = 'avances'
}

function cerrarSesion() {
  authStore.logout()
  logueado.value = false
}
</script>

<style scoped>
.app  { display: flex; flex-direction: column; min-height: 100vh; }
.main { flex: 1; padding: 1.5rem 1rem; max-width: 1100px; margin: 0 auto; width: 100%; }
@media (max-width: 640px) { .main { padding: 1rem 0.75rem; } }
</style>
