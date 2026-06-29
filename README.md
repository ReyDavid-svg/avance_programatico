# Avances Programáticos — UNSIS

Sistema web moderno para el registro de avances programáticos de los docentes de la Universidad de la Sierra Sur. Desarrollado con Vue 3 + Node.js + PostgreSQL.

---

## Arquitectura del proyecto

```
avances-programaticos/
├── frontend/                           # Aplicación web desarrollada con Vue 3 y Vite (SPA)
│   └── src/
│       ├── components/                 # Componentes reutilizables de la interfaz
│       │   ├── LoginView.vue           # Pantalla de inicio de sesión de los usuarios
│       │   ├── AppHeader.vue           # Encabezado de la aplicación con información del usuario y botón para cerrar sesión
│       │   ├── AppFooter.vue           # Pie de página de la aplicación
│       │   ├── AvanceForm.vue          # Formulario tipo asistente (wizard) dividido en 6 pasos para registrar avances
│       │   └── FileUpload.vue          # Componente para subir archivos mediante arrastrar y soltar (Drag & Drop)
│       ├── stores/
│       │   └── auth.js                 # Manejo del estado de autenticación utilizando JWT
│       ├── services/
│       │   └── api.js                  # Configuración de Axios para consumir la API y enviar automáticamente el token de autenticación
│       └── assets/
│           └── styles.css              # Hoja de estilos global de la aplicación
│
└── backend/                            # Servidor desarrollado con Node.js y Express que expone la API REST
    ├── controllers/                    # Contienen la lógica de negocio de cada módulo
    │   ├── authController.js           # Procesos de autenticación: inicio de sesión y consulta del perfil
    │   └── avancesController.js        # Operaciones CRUD (Crear, Consultar, Actualizar y Eliminar) de los avances
    ├── middleware/                     # Funciones intermedias que se ejecutan antes de llegar a los controladores
    │   ├── auth.js                     # Verifica que el usuario tenga un token JWT válido
    │   └── validarAvance.js            # Valida que los datos enviados cumplan con los requisitos utilizando express-validator
    ├── routes/                         # Definición de las rutas o endpoints de la API
    │   ├── auth.js                     # Rutas relacionadas con la autenticación (/api/auth/*)
    │   └── avances.js                  # Rutas para administrar los avances (/api/avances/*)
    ├── db/                             # Archivos relacionados con la base de datos PostgreSQL
    │   ├── pool.js                     # Configuración de la conexión a PostgreSQL mediante la librería pg
    │   ├── migrate.js                  # Script para crear la estructura de la base de datos (tablas)
    │   └── seed.js                     # Script para insertar datos iniciales, como usuarios administradores
    ├── uploads/                        # Carpeta donde se almacenan los archivos adjuntos cargados por los usuarios
    ├── index.js                        # Punto de entrada del servidor Express
    └── .env.example                    # Archivo de ejemplo con las variables de entorno necesarias
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
