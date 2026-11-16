
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

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

// Protección contra solicitudes excesivas
const passwordResetLimiter = require(
  "../middlewares/passwordResetLimiter"
);

const router = express.Router();

// ======================================
// REGISTRO E INICIO DE SESIÓN
// ======================================
router.post("/register", register);
router.post("/login", login);

// ======================================
// INICIO DE SESIÓN CON GOOGLE
// ======================================
// Se conectará al controlador de Google
// en el siguiente paso.
const googleLogin = require(
  "../controllers/googleAuthController"
);

router.post("/google", googleLogin);

// ======================================
// RENOVAR Y CERRAR SESIÓN
// ======================================
router.post("/refresh", refresh);
router.post("/logout", logout);

// ======================================
// VERIFICACIÓN DE CORREO
// ======================================
router.post("/verify-email", verifyEmail);

// ======================================
// RECUPERACIÓN DE CONTRASEÑA
// ======================================

// Máximo 5 solicitudes cada 15 minutos por IP
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPassword
);

// Cambiar contraseña mediante token válido
router.post("/reset-password", resetPassword);

// ======================================
// PERFIL DEL USUARIO AUTENTICADO
// ======================================
router.get("/profile", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Perfil obtenido correctamente",
    user: req.user
  });
});

// ======================================
// RUTA EXCLUSIVA PARA ADMINISTRADORES
// ======================================
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
// RUTA EXCLUSIVA PARA ORGANIZADORES
// ======================================
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
