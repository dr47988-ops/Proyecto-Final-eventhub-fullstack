
const express = require("express");

const {
  register,
  login,
  refresh,
  logout
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

// Registrar usuario
router.post("/register", register);

// Iniciar sesión
router.post("/login", login);

// Renovar tokens JWT
router.post("/refresh", refresh);

// Cerrar sesión
router.post("/logout", logout);

// Consultar perfil del usuario autenticado
router.get("/profile", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Perfil obtenido correctamente",
    user: req.user
  });
});

// Ruta de prueba exclusiva para administradores
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


 // Ruta de prueba exclusiva para organizadores
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
