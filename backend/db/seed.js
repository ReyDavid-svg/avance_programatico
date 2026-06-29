require('dotenv').config()
const bcrypt = require('bcryptjs')
const pool = require('./pool')

async function seed() {
  const client = await pool.connect()
  try {
    console.log('Creando usuarios de prueba...')

    const adminPass  = await bcrypt.hash('admin123', 10)
    const profPass   = await bcrypt.hash('prof123', 10)

    await client.query(`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES
        ($1, $2, $3, 'admin'),
        ($4, $5, $6, 'profesor')
      ON CONFLICT (email) DO NOTHING
    `, [
      'Administrador UNSIS', 'admin@unsis.edu.mx', adminPass,
      'Lirio Ruiz García',   'lruiz@unsis.edu.mx', profPass,
    ])

    console.log('✓ Usuarios creados:')
    console.log('  admin@unsis.edu.mx  / admin123  (rol: admin)')
    console.log('  lruiz@unsis.edu.mx  / prof123   (rol: profesor)')
  } catch (err) {
    console.error('Error en seed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
