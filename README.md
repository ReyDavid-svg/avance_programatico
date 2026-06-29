# Avances Programáticos — UNSIS

Sistema web moderno para el registro de avances programáticos de los docentes de la Universidad de la Sierra Sur. Desarrollado con Vue 3 + Node.js + PostgreSQL.

---

## Arquitectura del proyecto

```
avances-programaticos/
├── frontend/                   # Vue 3 + Vite (SPA)
│   └── src/
│       ├── components/
│       │   ├── LoginView.vue       # Pantalla de login
│       │   ├── AppHeader.vue       # Header con logout
│       │   ├── AppFooter.vue
│       │   ├── AvanceForm.vue      # Wizard 6 pasos
│       │   └── FileUpload.vue      # Drag & drop
│       ├── stores/
│       │   └── auth.js             # Estado de autenticación (JWT)
│       ├── services/
│       │   └── api.js              # Axios + interceptores de auth
│       └── assets/styles.css
│
└── backend/                    # Node.js + Express (API REST)
    ├── controllers/
    │   ├── authController.js       # Login / perfil
    │   └── avancesController.js    # CRUD avances
    ├── middleware/
    │   ├── auth.js                 # Verificación JWT
    │   └── validarAvance.js        # express-validator
    ├── routes/
    │   ├── auth.js                 # /api/auth/*
    │   └── avances.js              # /api/avances/*
    ├── db/
    │   ├── pool.js                 # Conexión a PostgreSQL (pg)
    │   ├── migrate.js              # Creación de tablas
    │   └── seed.js                 # Usuarios iniciales
    ├── uploads/                    # Archivos adjuntos
    ├── index.js
    └── .env.example
```

---

## Tecnologías utilizadas

| Capa      | Tecnología              | Versión   |
|-----------|-------------------------|-----------|
| Frontend  | Vue 3 (Composition API) | ^3.4.0    |
| Frontend  | Vite                    | ^5.0.0    |
| Frontend  | Axios                   | ^1.6.0    |
| Backend   | Node.js                 | ≥ 18.x    |
| Backend   | Express                 | ^4.18.2   |
| Backend   | pg (node-postgres)      | ^8.11.3   |
| Backend   | jsonwebtoken            | ^9.0.2    |
| Backend   | bcryptjs                | ^2.4.3    |
| Backend   | express-validator       | ^7.0.1    |
| Backend   | Multer                  | ^1.4.5    |
| Base de datos | PostgreSQL          | ≥ 14      |

---

## Instalación y ejecución

### Requisitos previos
- Node.js ≥ 18 · npm ≥ 9
- PostgreSQL ≥ 14 instalado y corriendo

### 1. Clonar el repositorio
```bash
git clone https://github.com/ReyDavid-svg/avance_programatico.git
cd avance_programatico
```

### 2. Configurar variables de entorno
```bash
cd backend
cp .env.example .env
# Edita .env con tus datos de PostgreSQL y un JWT_SECRET seguro
```

### 3. Preparar la base de datos
```bash
# En PostgreSQL, crea la base de datos:
psql -U postgres -c "CREATE DATABASE avances_db;"

# Desde el directorio backend:
npm install
npm run migrate     # Crea las tablas
npm run seed        # Crea usuarios iniciales
```

### 4. Iniciar el backend
```bash
npm run dev         # http://localhost:3000
```

### 5. Iniciar el frontend
```bash
cd ../frontend
npm install
npm run dev         # http://localhost:5173
```

---

## Credenciales iniciales (seed)

| Email                  | Contraseña | Rol       |
|------------------------|------------|-----------|
| admin@unsis.edu.mx     | admin123   | admin     |
| lruiz@unsis.edu.mx     | prof123    | profesor  |

> Por buena practica cambia las contraseñas en producción.

---

## Endpoints de la API

### Autenticación

| Método | Ruta            | Auth | Descripción           |
|--------|-----------------|------|-----------------------|
| POST   | `/api/auth/login` | ✗   | Iniciar sesión → JWT  |
| GET    | `/api/auth/me`    | ✓   | Datos del usuario     |

**Login — ejemplo de petición:**
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "lruiz@unsis.edu.mx", "password": "prof123" }
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { "id": 2, "nombre": "Lirio Ruiz García", "rol": "profesor" }
}
```

### Avances (requieren Bearer token)

| Método | Ruta               | Rol       | Descripción                           |
|--------|--------------------|-----------|---------------------------------------|
| GET    | `/api/avances`     | todos     | Listar (admin ve todos, prof solo suyos) |
| GET    | `/api/avances/:id` | todos     | Obtener uno por ID                    |
| POST   | `/api/avances`     | todos     | Crear nuevo avance (multipart/form-data) |

---

## Video de demostración

Video:

El video muestra el flujo completo: login → wizard de 6 pasos → envío → confirmación con folio, y explica la arquitectura frontend/backend.

---

## Notas de producción

- Reemplaza `JWT_SECRET` por una cadena aleatoria larga (≥ 32 caracteres)
- Configura un servidor web (nginx) como reverse proxy
- Usa variables de entorno en el servidor, nunca commitees el `.env`
- Los archivos subidos se almacenan en `backend/uploads/`; considera usar S3 o similar en producción
