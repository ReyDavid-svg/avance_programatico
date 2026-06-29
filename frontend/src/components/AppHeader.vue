<template>
  <header class="header">
    <div class="header-inner">
      <!-- BRAND -->
      <div class="brand">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        </svg>
        <div class="brand-text">
          <span class="brand-name">UNSIS</span>
          <span class="brand-sub">Avances Programáticos</span>
        </div>
      </div>

      <!-- NAV TABS (solo admin) -->
      <nav v-if="esAdmin" class="nav-tabs" role="tablist">
        <button
          v-for="tab in tabs" :key="tab.id"
          role="tab"
          class="nav-tab"
          :class="{ active: tabActivo === tab.id }"
          @click="$emit('cambiar-tab', tab.id)"
          :aria-selected="tabActivo === tab.id"
        >
          <span class="tab-icon" aria-hidden="true">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </nav>

      <!-- USUARIO -->
      <div class="header-user">
        <div class="user-pill">
          <span class="user-avatar">{{ iniciales }}</span>
          <div class="user-info">
            <span class="user-name">{{ usuario?.nombre }}</span>
            <span class="user-role">{{ usuario?.rol === 'admin' ? 'Administrador' : 'Profesor' }}</span>
          </div>
        </div>
        <button class="btn-logout" @click="$emit('logout')" title="Cerrar sesión" aria-label="Cerrar sesión">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  usuario:    Object,
  esAdmin:    Boolean,
  tabActivo:  String,
})
defineEmits(['logout', 'cambiar-tab'])

const tabs = [
  { id: 'avances',  icon: '', label: 'Avances' },
  { id: 'docentes', icon: '', label: 'Docentes' },
]

const iniciales = computed(() => {
  if (!props.usuario?.nombre) return '?'
  return props.usuario.nombre
    .split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()
})
</script>

<style scoped>
.header {
  background: var(--primary);
  box-shadow: 0 2px 10px rgba(0,0,0,0.25);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 60px;
}

/* BRAND */
.brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.brand-text { display: flex; flex-direction: column; line-height: 1.2; }
.brand-name { font-family: 'Outfit',sans-serif; font-weight: 700; font-size: 1rem; color: #ffffff; }
.brand-sub  { font-size: 0.65rem; color: rgba(216, 216, 216, 0.84); white-space: nowrap; }

/* NAV TABS */
.nav-tabs {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: center;
}
.nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all .15s;
  white-space: nowrap;
}
.nav-tab:hover  { background: rgba(255,255,255,0.1); color: white; }
.nav-tab.active { background: rgba(255,255,255,0.18); color: white; }
.tab-icon { font-size: 0.95rem; }

/* USUARIO */
.header-user { display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: auto; }
.user-pill   { display: flex; align-items: center; gap: 8px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white; font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-info   { display: flex; flex-direction: column; line-height: 1.2; }
.user-name   { font-size: 0.82rem; font-weight: 500; color: white; }
.user-role   { font-size: 0.65rem; color: rgba(255,255,255,0.5); }
.btn-logout {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-sm);
  color: rgba(255,255,255,0.8);
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
  flex-shrink: 0;
}
.btn-logout:hover { background: rgba(255,255,255,0.2); color: white; }

/* RESPONSIVE */
@media (max-width: 640px) {
  .brand-sub, .user-info { display: none; }
  .nav-tab .tab-label     { display: none; }
  .nav-tab { padding: 6px 10px; }
  .header-inner { gap: 0.5rem; }
}
</style>
