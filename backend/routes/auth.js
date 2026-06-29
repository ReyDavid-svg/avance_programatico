const express   = require('express')
const { login, perfil } = require('../controllers/authController')
const { autenticar }    = require('../middleware/auth')

const router = express.Router()

// POST /api/auth/login
router.post('/login', login)

// GET /api/auth/me
router.get('/me', autenticar, perfil)

module.exports = router
