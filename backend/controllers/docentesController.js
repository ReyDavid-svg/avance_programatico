const bcrypt = require('bcryptjs')
const pool   = require('../db/pool')

/** GET /api/docentes — solo admin */
async function listar(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, email, rol, activo, created_at
       FROM usuarios
       WHERE rol = 'profesor'
       ORDER BY nombre ASC`
    )
    res.json({ total: rows.length, docentes: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al listar docentes' })
  }
}

/** GET /api/docentes/:id — solo admin */
async function obtener(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = $1 AND rol = 'profesor'`,
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Docente no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener docente' })
  }
}

/** POST /api/docentes — solo admin */
async function crear(req, res) {
  const { nombre, email, password } = req.body
  if (!nombre?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' })

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()])
    if (existe.rows.length)
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' })

    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, 'profesor')
       RETURNING id, nombre, email, rol, activo, created_at`,
      [nombre.trim(), email.trim().toLowerCase(), hash]
    )
    res.status(201).json({ mensaje: 'Docente creado correctamente', docente: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear docente' })
  }
}

/** PUT /api/docentes/:id — solo admin */
async function actualizar(req, res) {
  const { nombre, email, password, activo } = req.body
  const { id } = req.params

  try {
    const { rows: existe } = await pool.query(
      `SELECT id FROM usuarios WHERE id = $1 AND rol = 'profesor'`, [id]
    )
    if (!existe.length) return res.status(404).json({ error: 'Docente no encontrado' })

    // Si cambia el email, verificar que no esté en uso
    if (email) {
      const dup = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id <> $2', [email.toLowerCase(), id]
      )
      if (dup.rows.length)
        return res.status(409).json({ error: 'Ese correo ya está en uso por otro usuario' })
    }

    // Construir la query dinámicamente
    const sets   = []
    const params = []
    let   idx    = 1

    if (nombre)           { sets.push(`nombre = $${idx++}`);   params.push(nombre.trim()) }
    if (email)            { sets.push(`email  = $${idx++}`);   params.push(email.trim().toLowerCase()) }
    if (password)         { const h = await bcrypt.hash(password, 10);
                            sets.push(`password = $${idx++}`); params.push(h) }
    if (activo !== undefined) { sets.push(`activo = $${idx++}`); params.push(activo) }

    if (!sets.length) return res.status(400).json({ error: 'No hay campos para actualizar' })

    params.push(id)
    const { rows } = await pool.query(
      `UPDATE usuarios SET ${sets.join(', ')} WHERE id = $${idx}
       RETURNING id, nombre, email, rol, activo, created_at`,
      params
    )
    res.json({ mensaje: 'Docente actualizado', docente: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar docente' })
  }
}

/** DELETE /api/docentes/:id — solo admin (desactiva, no borra físicamente) */
async function eliminar(req, res) {
  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET activo = FALSE WHERE id = $1 AND rol = 'profesor'
       RETURNING id, nombre`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Docente no encontrado' })
    res.json({ mensaje: `Docente "${rows[0].nombre}" desactivado correctamente` })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar docente' })
  }
}

/** PUT /api/docentes/:id/reactivar — solo admin */
async function reactivar(req, res) {
  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET activo = TRUE WHERE id = $1 AND rol = 'profesor'
       RETURNING id, nombre`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Docente no encontrado' })
    res.json({ mensaje: `Docente "${rows[0].nombre}" reactivado` })
  } catch (err) {
    res.status(500).json({ error: 'Error al reactivar docente' })
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar, reactivar }
