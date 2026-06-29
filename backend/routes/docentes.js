const express  = require('express')
const { listar, obtener, crear, actualizar, eliminar, reactivar } = require('../controllers/docentesController')
const { autenticar, soloAdmin } = require('../middleware/auth')

const router = express.Router()
router.use(autenticar, soloAdmin)   // Todas las rutas: token + admin

router.get('/',              listar)
router.get('/:id',           obtener)
router.post('/',             crear)
router.put('/:id',           actualizar)
router.delete('/:id',        eliminar)
router.put('/:id/reactivar', reactivar)

module.exports = router
