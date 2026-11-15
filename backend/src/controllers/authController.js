
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================
// REGISTRAR UN NUEVO USUARIO
// ======================================
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

// ======================================
// INICIAR SESIÓN
// ======================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos obligatorios
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios"
      });
    }

    // Buscar usuario incluyendo contraseña cifrada
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Credenciales incorrectas"
      });
    }

    // Comparar contraseña con bcrypt
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Credenciales incorrectas"
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive) {
      return res.status(403).json({
        message: "Cuenta desactivada"
      });
    }

    // Generar token de acceso
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generar token de renovación
    const refreshToken = jwt.sign(
      {
        userId: user._id.toString()
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Respuesta exitosa
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

// Exportar funciones
module.exports = {
  register,
  login
};
