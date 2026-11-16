
const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const {
  getUsers,
  updateUserRole,
  updateUserStatus
} = require("../controllers/adminUserController");

const router = express.Router();

// Solo administradores autenticados
router.use(authMiddleware);
router.use(authorizeRoles("admin"));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Administración de usuarios
 *     summary: Consultar todos los usuarios
 *     description: Devuelve los usuarios registrados. Solo administradores.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios obtenidos correctamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/users", getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags:
 *       - Administración de usuarios
 *     summary: Cambiar el rol de un usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [attendee, organizer, admin]
 *                 example: organizer
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente
 *       400:
 *         description: Identificador o rol inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos o modificación propia prohibida
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/users/:id/role", updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags:
 *       - Administración de usuarios
 *     summary: Activar o desactivar una cuenta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Identificador del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Identificador o estado inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos o desactivación propia prohibida
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/users/:id/status", updateUserStatus);

module.exports = router;
