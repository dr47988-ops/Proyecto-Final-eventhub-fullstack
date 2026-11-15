
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Registrar un nuevo usuario
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar campos obligatorios
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Nombre, correo y contraseña son obligatorios"
      });
    }

    // Validar contraseña
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "La contraseña debe tener entre 8 y 72 caracteres"
      });
    }

    // Normalizar correo
    const normalizedEmail = email.trim().toLowerCase();

    // Verificar si ya existe
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "El correo ya está registrado"
      });
    }

    // Cifrar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario con rol de asistente
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "attendee"
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "El correo ya está registrado"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Datos de registro inválidos"
      });
    }

    console.error("Error al registrar usuario:", error.message);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

module.exports = { register };
