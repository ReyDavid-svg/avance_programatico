import { reactive, computed } from 'vue'

const KEY = 'avances_token'
const KEY_USER = 'avances_user'

const state = reactive({
  token:   localStorage.getItem(KEY)      || null,
  usuario: JSON.parse(localStorage.getItem(KEY_USER) || 'null'),
})

export const authStore = {
  state,

  get token()   { return state.token },
  get usuario() { return state.usuario },
  get logueado() { return !!state.token },
  get esAdmin()  { return state.usuario?.rol === 'admin' },

  login(token, usuario) {
    state.token   = token
    state.usuario = usuario
    localStorage.setItem(KEY, token)
    localStorage.setItem(KEY_USER, JSON.stringify(usuario))
  },

  logout() {
    state.token   = null
    state.usuario = null
    localStorage.removeItem(KEY)
    localStorage.removeItem(KEY_USER)
  },
}
