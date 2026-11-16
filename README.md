# EventHub — Plataforma Full Stack de Gestión de Eventos

## Descripción del proyecto

EventHub es una plataforma web desarrollada para la gestión de eventos y reservaciones. Su objetivo es facilitar la administración de eventos, usuarios y procesos relacionados con la participación en actividades.

El proyecto está desarrollado con una arquitectura Full Stack, utilizando Vue 3 para el frontend, Node.js y Express para el backend y MongoDB como base de datos.

## Tecnologías utilizadas

**Frontend**
- Vue 3
- Vue Router
- Vite
- JavaScript
- HTML y CSS

**Backend**
- Node.js
- Express
- MongoDB y Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Nodemailer
- Google OAuth
- Jest y Supertest

## Estructura del proyecto

```text
Proyecto-Final-eventhub-fullstack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── router/
│   │   ├── services/
│   │   └── views/
│   └── package.json
└── README.md
```

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Node.js y npm.
- Una instancia de MongoDB local o MongoDB Atlas.
- Git.
- Un editor de código, como Visual Studio Code.

## Instalación del backend

Desde la carpeta principal del proyecto:

```bash
cd backend
npm ci
```

Crear un archivo `.env` tomando como referencia `.env.example`.

Configurar las variables de entorno necesarias:

```dotenv
PORT=3000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/eventhub

JWT_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=

FRONTEND_URL=http://localhost:5173

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Los secretos JWT deben configurarse con valores seguros. Para utilizar Google OAuth y las funciones de correo electrónico también se necesitan las credenciales correspondientes.

**Importante:** No subir el archivo `.env` ni compartir contraseñas o credenciales reales.

### Iniciar el backend

```bash
node src/server.js
```

El puerto predeterminado es `3000`.

## Instalación del frontend

Abrir otra terminal y ejecutar, desde la carpeta principal:

```bash
cd frontend
npm ci
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación en el navegador, normalmente `http://localhost:5173`.

## Módulo de autenticación 

El módulo de autenticación permite gestionar el acceso de los usuarios a la plataforma.

### Funcionalidades implementadas

1. Registro de usuarios con validaciones.
2. Inicio de sesión con correo y contraseña.
3. Almacenamiento seguro de contraseñas mediante bcrypt.
4. Autenticación mediante JWT.
5. Renovación de sesiones utilizando refresh tokens.
6. Cierre de sesión y revocación de tokens.
7. Verificación del correo electrónico.
8. Recuperación y restablecimiento de contraseña.
9. Inicio de sesión mediante Google OAuth.
10. Control de acceso mediante roles.
11. Protección de rutas privadas.

### Endpoints de autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/google` | Autenticación con Google |
| POST | `/api/auth/refresh` | Renovar sesión |
| POST | `/api/auth/logout` | Cerrar sesión |
| POST | `/api/auth/verify-email` | Verificar correo |
| POST | `/api/auth/forgot-password` | Solicitar recuperación |
| POST | `/api/auth/reset-password` | Restablecer contraseña |
| GET | `/api/auth/profile` | Consultar perfil autenticado |
| GET | `/api/auth/admin-test` | Validar acceso de administrador |
| GET | `/api/auth/organizer-test` | Validar acceso de organizador |

## Pruebas automatizadas

El módulo de autenticación cuenta con 20 pruebas automatizadas desarrolladas con Jest y Supertest.

Estas pruebas verifican escenarios exitosos y negativos relacionados con:

- Registro de usuarios.
- Validación de campos obligatorios.
- Inicio de sesión.
- Contraseñas incorrectas.
- Cuentas desactivadas.
- Correos no verificados.
- Renovación y cierre de sesión.
- Recuperación de contraseña.
- Verificación del correo electrónico.

### Ejecutar las pruebas

Desde la carpeta `backend`:

```bash
npm test
```

### Último resultado verificado

```text
PASS tests/auth.test.js

Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
```

Las pruebas utilizan mocks para simular modelos y servicios, por lo que no requieren conectarse a MongoDB Atlas durante su ejecución.

## Control de versiones

El proyecto utiliza Git y GitHub para gestionar el código y permitir el trabajo colaborativo.

El módulo de autenticación se desarrolló en la rama `feature/autenticacion` y posteriormente se integró en `main` mediante Pull Requests.

## Estado del proyecto

El módulo de autenticación está implementado e integrado en la rama principal, con sus 20 pruebas automatizadas aprobadas.

Los demás módulos de la plataforma se desarrollan de acuerdo con la distribución de responsabilidades del equipo.
