const pool = require('../db/pool')

function generarFolio(id) {
  const year = new Date().getFullYear()
  return `AP-${year}-${String(id).padStart(4, '0')}`
}

function parsearArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  return [val].filter(Boolean)
}

/**
 * POST /api/avances
 */
async function crearAvance(req, res) {
  const uid = req.usuario.id
  const {
    nombreProfesor, licenciatura, numeroAvance, nombreMateria, grupo,
    horasTotales, horasEfectivas,
    porcentajeAvanceSemestre, porcentajeAvancePrograma, porcentajeAvanceProyecto,
    promedioGrupo, promedioAprobados, promedioReprobados, porcentajeReprobados,
    temaVistos, herramientasPlataforma, recursosAdicionales,
    tieneAsesorias, recursosAsesorias, materiasAsesorias,
    observaciones,
  } = req.body

  const archivos = req.files || {}
  const listaAsistencia  = archivos.listaAsistencia  ? archivos.listaAsistencia[0].filename  : null
  const reporteAsesorias = archivos.reporteAsesorias ? archivos.reporteAsesorias[0].filename : null

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(`
      INSERT INTO avances (
        usuario_id, nombre_profesor, licenciatura, numero_avance, nombre_materia, grupo,
        horas_totales, horas_efectivas, porcentaje_avance_semestre, porcentaje_avance_programa, porcentaje_avance_proyecto,
        promedio_grupo, promedio_aprobados, promedio_reprobados, porcentaje_reprobados,
        temas_vistos, herramientas_plataforma, recursos_adicionales,
        tiene_asesorias, recursos_asesorias, materias_asesorias,
        observaciones, lista_asistencia, reporte_asesorias
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,
        $12,$13,$14,$15,
        $16,$17,$18,
        $19,$20,$21,
        $22,$23,$24
      ) RETURNING id
    `, [
      uid, nombreProfesor, licenciatura, numeroAvance, nombreMateria, grupo,
      horasTotales || null, Number(horasEfectivas) || 0,
      Number(porcentajeAvanceSemestre) || 0, Number(porcentajeAvancePrograma) || 0,
      porcentajeAvanceProyecto || 'No aplica',
      promedioGrupo, promedioAprobados || null, promedioReprobados || null,
      porcentajeReprobados || 'No aplica',
      temaVistos, parsearArray(herramientasPlataforma), recursosAdicionales,
      tieneAsesorias === 'true' || tieneAsesorias === true,
      parsearArray(recursosAsesorias), materiasAsesorias || null,
      observaciones, listaAsistencia, reporteAsesorias,
    ])

    const id    = rows[0].id
    const folio = generarFolio(id)
    await client.query('UPDATE avances SET folio = $1 WHERE id = $2', [folio, id])
    await client.query('COMMIT')

    res.status(201).json({ mensaje: 'Avance registrado correctamente', folio, id })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error al crear avance:', err)
    res.status(500).json({ error: 'Error al guardar el avance' })
  } finally {
    client.release()
  }
}

/**
 * GET /api/avances
 */
async function listarAvances(req, res) {
  try {
    const uid = req.usuario.id
    const rol = req.usuario.rol
    let query, params

    if (rol === 'admin') {
      query  = `SELECT a.*, u.nombre AS nombre_usuario, u.email
                FROM avances a JOIN usuarios u ON a.usuario_id = u.id
                ORDER BY a.created_at DESC`
      params = []
    } else {
      query  = `SELECT * FROM avances WHERE usuario_id = $1 ORDER BY created_at DESC`
      params = [uid]
    }

    const { rows } = await pool.query(query, params)
    res.json({ total: rows.length, avances: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener avances' })
  }
}

/**
 * GET /api/avances/:id
 */
async function obtenerAvance(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM avances WHERE id = $1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Avance no encontrado' })

    // Profesores solo ven sus propios avances
    if (req.usuario.rol !== 'admin' && rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'Sin permiso para ver este avance' })
    }

    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener avance' })
  }
}

module.exports = { crearAvance, listarAvances, obtenerAvance }
