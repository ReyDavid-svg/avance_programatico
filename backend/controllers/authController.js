const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const pool     = require('../db/pool')

const SECRET  = process.env.JWT_SECRET    || 'secret_dev'
const EXPIRES = process.env.JWT_EXPIRES_IN || '8h'

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' })
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, password, rol FROM usuarios WHERE email = $1 AND activo = TRUE',
      [email.trim().toLowerCase()]
    )

    const usuario = rows[0]
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const coincide = await bcrypt.compare(password, usuario.password)
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const payload = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    const token   = jwt.sign(payload, SECRET, { expiresIn: EXPIRES })

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

/**
 * GET /api/auth/me  (requiere token)
 */
async function perfil(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { login, perfil }
