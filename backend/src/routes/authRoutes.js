
const express = require("express");

const {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const googleLogin = require("../controllers/googleAuthController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
  validateRegister,
  validateLogin,
  validateForgotPassword
} = require("../validators/authValidator");

const passwordResetLimiter = require(
  "../middlewares/passwordResetLimiter"
);

const router = express.Router();

// ======================================
// REGISTRO DE USUARIOS
// ======================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea una cuenta de asistente y envía un correo de verificación.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Daniela
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 72
 *                 example: ClaveSegura123
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Correo ya registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/register", validateRegister, register);

// ======================================
// INICIO DE SESIÓN
// ======================================

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica mediante correo y contraseña.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: ClaveSegura123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 *       403:
 *         description: Cuenta no verificada o desactivada
 *       500:
 *         description: Error interno del servidor
 */
router.post("/login", validateLogin, login);

// ======================================
// GOOGLE OAUTH 2.0
// ======================================

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Iniciar sesión con Google
 *     description: Autentica mediante Google OAuth 2.0.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Token de identidad de Google.
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *       400:
 *         description: Solicitud inválida
 *       401:
 *         description: Token de Google inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post("/google", googleLogin);

// ======================================
// RENOVAR SESIÓN
// ======================================

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar sesión
 *     description: Genera un nuevo access token utilizando la cookie de refresh token.
 *     tags:
 *       - Autenticación
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesión renovada correctamente
 *       401:
 *         description: Sesión inválida o expirada
 *       500:
 *         description: Error interno del servidor
 */
router.post("/refresh", refresh);

// ======================================
// CERRAR SESIÓN
// ======================================

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Revoca el refresh token y elimina la cookie de sesión.
 *     tags:
 *       - Autenticación
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       500:
 *         description: Error interno del servidor
 */
router.post("/logout", logout);

// ======================================
// VERIFICACIÓN DE CORREO
// ======================================

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verificar correo electrónico
 *     description: Verifica la cuenta utilizando un token enviado por correo.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de verificación recibido por correo.
 *     responses:
 *       200:
 *         description: Correo verificado correctamente
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/verify-email", verifyEmail);

// ======================================
// RECUPERAR CONTRASEÑA
// ======================================

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un enlace de recuperación al correo registrado.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Solicitud procesada
 *       400:
 *         description: Correo inválido
 *       429:
 *         description: Demasiadas solicitudes
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateForgotPassword,
  forgotPassword
);

// ======================================
// RESTABLECER CONTRASEÑA
// ======================================

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Actualiza la contraseña utilizando un token válido.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de recuperación.
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NuevaClave123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o contraseña incorrecta
 *       500:
 *         description: Error interno del servidor
 */
router.post("/reset-password", resetPassword);

// ======================================
// PERFIL DEL USUARIO
// ======================================

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Consultar perfil
 *     description: Obtiene los datos del usuario autenticado.
 *     tags:
 *       - Usuarios y roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       401:
 *         description: No autorizado
 */
router.get("/profile", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Perfil obtenido correctamente",
    user: req.user
  });
});

// ======================================
// ACCESO DE ADMINISTRADORES
// ======================================

/**
 * @swagger
 * /api/auth/admin-test:
 *   get:
 *     summary: Verificar acceso de administrador
 *     description: Comprueba los permisos del rol administrador.
 *     tags:
 *       - Usuarios y roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso autorizado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado
 */
router.get(
  "/admin-test",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    return res.status(200).json({
      message: "Acceso autorizado para administrador"
    });
  }
);

// ======================================
// ACCESO DE ORGANIZADORES
// ======================================


/**
 * @swagger
 * /api/auth/organizer-test:
 *   get:
 *     summary: Verificar acceso de organizador
 *     description: Comprueba los permisos del rol organizador.
 *     tags:
 *       - Usuarios y roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso autorizado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado
 */

router.get(
  "/organizer-test",
  authMiddleware,
  authorizeRoles("organizer"),
  (req, res) => {
    return res.status(200).json({
      message: "Acceso autorizado para organizador"
    });
  }
);

module.exports = router;
