
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const EmailVerificationToken = require("../models/EmailVerificationToken");

const {
  sendVerificationEmail
} = require("../services/emailService");

const {
  createEmailVerificationToken,
  hashToken
} = require("../services/emailVerificationService");

const {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken
} = require("../services/tokenService");

// ======================================
// REGISTRAR UN NUEVO USUARIO
// ======================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

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

    // Validar longitud de contraseña
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "La contraseña debe tener entre 8 y 72 caracteres"
      });
    }

    // Normalizar correo
    const normalizedEmail = email.trim().toLowerCase();

    // Verificar si el correo ya existe
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

    // Crear usuario con rol attendee
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "attendee",
      isEmailVerified: false
    });

    // Generar token y enviar correo de verificación
    let verificationEmailSent = false;

    try {
      const verificationToken =
        await createEmailVerificationToken(user._id);

      await sendVerificationEmail(
        user.email,
        verificationToken
      );

      verificationEmailSent = true;

    } catch (emailError) {
      console.error(
        "Error al preparar o enviar la verificación:",
        emailError.message
      );
    }

    // Respuesta del registro
    return res.status(201).json({
      message: verificationEmailSent
        ? "Usuario registrado correctamente. Revisa tu correo para verificar tu cuenta."
        : "Usuario registrado, pero no se pudo enviar el correo de verificación. Solicita un nuevo enlace.",
      verificationEmailSent,
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

    console.error(
      "Error al registrar usuario:",
      error.message
    );

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
    const { email, password } = req.body || {};

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

    // Verificar contraseña
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

    // Generar access token
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256"
      }
    );

    // Generar refresh token
    const refreshToken = await createRefreshToken(
      user._id
    );

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error(
      "Error al iniciar sesión:",
      error.message
    );

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

// ======================================
// RENOVAR TOKENS JWT
// ======================================
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (
      typeof refreshToken !== "string" ||
      !refreshToken.trim()
    ) {
      return res.status(400).json({
        message: "Refresh token obligatorio"
      });
    }

    // Verificar firma y vencimiento
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      {
        algorithms: ["HS256"]
      }
    );

    // Buscar usuario activo
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Sesión no autorizada"
      });
    }

    // Rotar refresh token
    const result = await rotateRefreshToken(
      refreshToken
    );

    if (!result) {
      return res.status(401).json({
        message: "Refresh token inválido o revocado"
      });
    }

    // Generar nuevo access token
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256"
      }
    );

    return res.status(200).json({
      message: "Tokens renovados correctamente",
      accessToken,
      refreshToken: result.refreshToken
    });

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Refresh token inválido o expirado"
      });
    }

    console.error(
      "Error al renovar tokens:",
      error.message
    );

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

// ======================================
// CERRAR SESIÓN (LOGOUT)
// ======================================
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (
      typeof refreshToken !== "string" ||
      !refreshToken.trim()
    ) {
      return res.status(400).json({
        message: "Refresh token obligatorio"
      });
    }

    const revoked = await revokeRefreshToken(
      refreshToken
    );

    if (!revoked) {
      return res.status(401).json({
        message: "Refresh token inválido o revocado"
      });
    }

    return res.status(200).json({
      message: "Sesión cerrada correctamente"
    });

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Refresh token inválido o expirado"
      });
    }

    console.error(
      "Error al cerrar sesión:",
      error.message
    );

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

// ======================================
// VERIFICAR CORREO ELECTRÓNICO
// ======================================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body || {};

    if (
      typeof token !== "string" ||
      !token.trim()
    ) {
      return res.status(400).json({
        message: "Token de verificación obligatorio"
      });
    }

    // Obtener hash del token
    const tokenHash = hashToken(token.trim());

    // Buscar token válido y no utilizado
    const verification = await EmailVerificationToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return res.status(400).json({
        message: "Enlace de verificación inválido o expirado"
      });
    }

    // Buscar usuario
    const user = await User.findById(
      verification.user
    );

    if (!user || !user.isActive) {
      return res.status(400).json({
        message: "No se puede verificar esta cuenta"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "El correo ya está verificado"
      });
    }

    // Consumir token una sola vez
    const consumed = await EmailVerificationToken.findOneAndUpdate(
      {
        _id: verification._id,
        usedAt: null,
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          usedAt: new Date()
        }
      },
      {
        new: true
      }
    );

    if (!consumed) {
      return res.status(400).json({
        message: "El enlace ya fue utilizado o expiró"
      });
    }

    // Marcar correo como verificado
    user.isEmailVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Correo electrónico verificado correctamente"
    });

  } catch (error) {
    console.error(
      "Error al verificar correo:",
      error.message
    );

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

// ======================================
// EXPORTAR FUNCIONES
// ======================================
module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail
};
