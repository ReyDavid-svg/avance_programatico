require('dotenv').config()
const pool = require('./pool')

const SQL = `
-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios (profesores y admin)
CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(120) NOT NULL,
  email       VARCHAR(120) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  rol         VARCHAR(20)  NOT NULL DEFAULT 'profesor' CHECK (rol IN ('admin', 'profesor')),
  activo      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de avances programáticos
CREATE TABLE IF NOT EXISTS avances (
  id                          SERIAL PRIMARY KEY,
  folio                       VARCHAR(20) UNIQUE,
  usuario_id                  INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,

  -- Identificación
  nombre_profesor             VARCHAR(120) NOT NULL,
  licenciatura                VARCHAR(120) NOT NULL,
  numero_avance               VARCHAR(20)  NOT NULL,
  nombre_materia              VARCHAR(120) NOT NULL,
  grupo                       VARCHAR(20)  NOT NULL,

  -- Horas y porcentajes
  horas_totales               INT,
  horas_efectivas             INT          NOT NULL DEFAULT 0,
  porcentaje_avance_semestre  INT          NOT NULL DEFAULT 0,
  porcentaje_avance_programa  INT          NOT NULL DEFAULT 0,
  porcentaje_avance_proyecto  VARCHAR(20)  NOT NULL DEFAULT 'No aplica',

  -- Calificaciones
  promedio_grupo              VARCHAR(10),
  promedio_aprobados          VARCHAR(10),
  promedio_reprobados         VARCHAR(10),
  porcentaje_reprobados       VARCHAR(10)  NOT NULL DEFAULT 'No aplica',

  -- Contenido
  temas_vistos                TEXT,
  herramientas_plataforma     TEXT[],
  recursos_adicionales        VARCHAR(255),

  -- Asesorías
  tiene_asesorias             BOOLEAN      NOT NULL DEFAULT FALSE,
  recursos_asesorias          TEXT[],
  materias_asesorias          VARCHAR(255),

  -- Observaciones
  observaciones               TEXT,

  -- Archivos
  lista_asistencia            VARCHAR(255),
  reporte_asesorias           VARCHAR(255),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

DROP TRIGGER IF EXISTS trg_avances_updated_at ON avances;
CREATE TRIGGER trg_avances_updated_at
  BEFORE UPDATE ON avances
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_avances_usuario_id ON avances(usuario_id);
CREATE INDEX IF NOT EXISTS idx_avances_folio ON avances(folio);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
`

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('Ejecutando migraciones...')
    await client.query(SQL)
    console.log('✓ Tablas creadas correctamente')
  } catch (err) {
    console.error('Error en migración:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
