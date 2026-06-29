const { body, validationResult } = require('express-validator')

const reglasValidacion = [
  body('nombreProfesor')
    .trim()
    .notEmpty()
    .withMessage('El nombre del profesor es obligatorio'),

  body('licenciatura')
    .notEmpty()
    .withMessage('La licenciatura de adscripción es obligatoria'),

  body('numeroAvance')
    .notEmpty()
    .withMessage('El número de avance es obligatorio'),

  body('nombreMateria')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la materia es obligatorio'),

  body('grupo')
    .notEmpty()
    .withMessage('El grupo es obligatorio'),

  body('horasEfectivas')
    .isInt({ min: 0 })
    .withMessage('Las horas efectivas deben ser un número entero mayor o igual a 0'),

  body('porcentajeAvanceSemestre')
    .isInt({ min: 0, max: 100 })
    .withMessage('El porcentaje de avance del semestre debe ser un entero entre 0 y 100'),

  body('porcentajeAvancePrograma')
    .isInt({ min: 0, max: 100 })
    .withMessage('El porcentaje de avance del programa debe ser un entero entre 0 y 100'),

  body('promedioGrupo')
    .notEmpty()
    .withMessage('El promedio del grupo es obligatorio'),

  body('temaVistos')
    .trim()
    .notEmpty()
    .withMessage('Los temas vistos son obligatorios'),

  body('tieneAsesorias')
    .notEmpty()
    .withMessage('Debe indicar si impartió asesorías'),
]

const manejarErrores = (req, res, next) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    return res.status(422).json({ errores: errores.array() })
  }
  next()
}

module.exports = { reglasValidacion, manejarErrores }
