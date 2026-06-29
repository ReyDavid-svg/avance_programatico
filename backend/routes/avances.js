const express    = require('express')
const multer     = require('multer')
const path       = require('path')
const { crearAvance, listarAvances, obtenerAvance } = require('../controllers/avancesController')
const { reglasValidacion, manejarErrores }          = require('../middleware/validarAvance')
const { autenticar }                                = require('../middleware/auth')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}_${Date.now()}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  /\.(pdf|xls|xlsx|ods|jpeg|jpg)$/i.test(file.originalname)
    ? cb(null, true)
    : cb(new Error('Tipo de archivo no permitido'), false)
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })
const uploadFields = upload.fields([
  { name: 'listaAsistencia',  maxCount: 1 },
  { name: 'reporteAsesorias', maxCount: 1 },
])

// Todas las rutas requieren autenticación
router.use(autenticar)

router.get('/',    listarAvances)
router.get('/:id', obtenerAvance)
router.post('/', uploadFields, reglasValidacion, manejarErrores, crearAvance)

module.exports = router
