
const mongoose = require("mongoose");
const User = require("../models/User");

// ======================================
// CONSULTAR USUARIOS
// ======================================

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -googleId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Usuarios obtenidos correctamente",
      users
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// CAMBIAR ROL DE UN USUARIO
// ======================================

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Identificador de usuario inválido"
      });
    }

    if (!["attendee", "organizer", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Rol inválido"
      });
    }

    // Impedir que el administrador cambie su propio rol
    if (String(req.user.userId || req.user.id || req.user._id) === id) {
      return res.status(403).json({
        message: "No puedes modificar tu propio rol"
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -googleId");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      message: "Rol actualizado correctamente",
      user
    });
  } catch (error) {
    next(error);
  }
};

// ======================================
// ACTIVAR O DESACTIVAR CUENTA
// ======================================

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Identificador de usuario inválido"
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "El estado debe ser verdadero o falso"
      });
    }

    // Impedir que un administrador desactive su propia cuenta
    if (
      isActive === false &&
      String(req.user.userId || req.user.id || req.user._id) === id
    ) {
      return res.status(403).json({
        message: "No puedes desactivar tu propia cuenta"
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password -googleId");

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      message: "Estado de la cuenta actualizado correctamente",
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus
};
