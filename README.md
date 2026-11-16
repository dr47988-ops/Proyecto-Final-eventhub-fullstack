
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
- OpenAPI 3.0
- swagger-jsdoc
- Scalar API Reference

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

Vite mostrará en la terminal la dirección local para abrir la aplicación en el navegador, normalmente:

http://localhost:5173

## Módulo de autenticación y seguridad

El módulo de autenticación permite gestionar el acceso de los usuarios a la plataforma, proteger sus cuentas y controlar los permisos según el rol asignado.

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
12. Consulta de información del usuario autenticado.

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

## Módulo de administración de usuarios

El sistema incluye funcionalidades para que los administradores puedan gestionar las cuentas registradas en EventHub.

### Funcionalidades implementadas

1. Consultar la lista de usuarios registrados.
2. Modificar el rol de un usuario.
3. Activar o desactivar cuentas.
4. Validar los permisos de administrador.
5. Impedir que un administrador cambie su propio rol.
6. Impedir que un administrador desactive su propia cuenta.
7. Validar los datos recibidos en las solicitudes.

### Endpoints de administración

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/admin/users` | Consultar usuarios registrados |
| PATCH | `/api/admin/users/:id/role` | Modificar el rol de un usuario |
| PATCH | `/api/admin/users/:id/status` | Activar o desactivar una cuenta |

Estas rutas requieren autenticación mediante JWT y permisos de administrador.

Los usuarios sin permisos administrativos no pueden acceder a estas funcionalidades.

## Documentación de la API con Scalar

EventHub utiliza **Scalar API Reference**, junto con **OpenAPI 3.0 y swagger-jsdoc**, para proporcionar documentación interactiva de los endpoints del backend.

Esta herramienta permite consultar las operaciones disponibles de la API y facilita la comprensión de las solicitudes y respuestas del sistema.

### Acceso a la documentación

Primero, iniciar el servidor backend:

```bash
cd backend
node src/server.js
```

Después, abrir el navegador e ingresar a:

**http://localhost:3000/reference**

### Funcionalidades de Scalar

La documentación interactiva permite:

- Consultar los endpoints documentados.
- Identificar los métodos HTTP disponibles.
- Revisar los parámetros de las solicitudes.
- Consultar los cuerpos JSON utilizados.
- Visualizar las respuestas documentadas.
- Revisar los requisitos de autenticación.
- Probar solicitudes desde la interfaz, cuando la configuración y los permisos lo permiten.

### Seguridad de los endpoints

Los endpoints protegidos requieren un token JWT válido.

Algunas operaciones también necesitan permisos específicos según el rol del usuario.

El backend utiliza respuestas HTTP para indicar problemas de autenticación y autorización:

- `401 Unauthorized`: la solicitud no cuenta con autenticación válida.
- `403 Forbidden`: el usuario está autenticado, pero no tiene los permisos necesarios.

La documentación de Scalar se encuentra disponible mientras el servidor backend esté en ejecución.

## Pruebas automatizadas

Los módulos de autenticación y administración de usuarios cuentan con **29 pruebas automatizadas** desarrolladas con Jest y Supertest.

Las pruebas están organizadas en dos archivos:

- `tests/auth.test.js`: 20 pruebas de autenticación.
- `tests/adminUsers.test.js`: 9 pruebas de administración de usuarios.

### Pruebas de autenticación

Se verifican escenarios exitosos y negativos relacionados con:

- Registro de usuarios.
- Validación de campos obligatorios.
- Inicio de sesión.
- Contraseñas incorrectas.
- Cuentas desactivadas.
- Correos no verificados.
- Renovación y cierre de sesión.
- Recuperación de contraseña.
- Verificación del correo electrónico.

### Pruebas de administración

Se verifican escenarios relacionados con:

- Consulta de usuarios.
- Restricciones de acceso según el rol.
- Modificación de roles.
- Activación y desactivación de cuentas.
- Validaciones de seguridad.
- Protección frente a cambios no permitidos sobre la propia cuenta administrativa.

### Ejecutar las pruebas

Desde la carpeta `backend`:

```bash
npm test
```

### Último resultado verificado

```text
PASS tests/auth.test.js
PASS tests/adminUsers.test.js

Test Suites: 2 passed, 2 total
Tests:       29 passed, 29 total
```

Las pruebas automatizadas utilizan mocks para simular modelos y servicios, por lo que no requieren conectarse a MongoDB Atlas durante su ejecución.

Adicionalmente, se realizaron comprobaciones manuales utilizando cuentas con diferentes roles y una base de datos MongoDB Atlas.

Se verificó el acceso de administradores, las restricciones para usuarios sin permisos y las operaciones de cambio de rol y estado de cuentas.

## Interfaz de usuario

El frontend de EventHub está desarrollado con Vue 3 y Vue Router.

Las pantallas correspondientes al módulo de autenticación cuentan con un diseño visual unificado y adaptable a diferentes tamaños de pantalla.

### Pantallas implementadas

1. Inicio de sesión.
2. Registro de usuarios.
3. Recuperación de contraseña.
4. Restablecimiento de contraseña.
5. Verificación de correo electrónico.
6. Dashboard del usuario autenticado.

El diseño utiliza una distribución de dos secciones en las pantallas de autenticación, con un panel informativo y un formulario principal.

El Dashboard muestra información de la cuenta y permite cerrar sesión.

## Control de versiones

El proyecto utiliza Git y GitHub para gestionar el código y permitir el trabajo colaborativo.

El módulo de autenticación se desarrolló inicialmente en la rama `feature/autenticacion` y posteriormente se integró en `main` mediante Pull Requests.

Las funcionalidades de administración de usuarios, las pruebas adicionales y las mejoras visuales del frontend también se integraron en la rama principal.

### Repositorio

https://github.com/dr47988-ops/Proyecto-Final-eventhub-fullstack

## Estado del proyecto

El módulo de autenticación, seguridad y administración de usuarios está implementado e integrado en la rama principal.

Se cuenta con:

- Registro y autenticación de usuarios.
- Inicio de sesión con Google OAuth.
- Verificación y recuperación de cuentas.
- Autorización mediante roles.
- Administración de usuarios.
- Documentación interactiva con Scalar.
- 29 pruebas automatizadas aprobadas.
- Pantallas de autenticación y Dashboard con diseño unificado.
- Código actualizado en GitHub.

Los demás módulos de la plataforma se desarrollan de acuerdo con la distribución de responsabilidades del equipo.

La integración y validación final de la plataforma completa se realizará cuando los demás módulos estén terminados.
