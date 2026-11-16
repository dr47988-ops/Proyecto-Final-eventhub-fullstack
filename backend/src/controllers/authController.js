
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const EmailVerificationToken = require("../models/EmailVerificationToken");
const PasswordResetToken = require("../models/PasswordResetToken");

const {
  sendVerificationEmail,
  sendPasswordResetEmail
} = require("../services/emailService");

const {
  createEmailVerificationToken,
  hashToken
} = require("../services/emailVerificationService");

const {
  createPasswordResetToken,
  hashPasswordResetToken
} = require("../services/passwordResetService");

const {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens
} = require("../services/tokenService");

const {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshCookie
} = require("../utils/authCookies");

// ======================================
// REGISTRAR UN NUEVO USUARIO
// ======================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

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

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "La contraseña debe tener entre 8 y 72 caracteres"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "El correo ya está registrado"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "attendee",
      isEmailVerified: false
    });

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
        "Error al enviar verificación:",
        emailError.message
      );
    }

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

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Credenciales incorrectas"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Credenciales incorrectas"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Cuenta desactivada"
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Debes verificar tu correo electrónico antes de iniciar sesión."
      });
    }

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

    const refreshToken = await createRefreshToken(
      user._id
    );

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      accessToken,
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
// RENOVAR SESIÓN
// ======================================
const refresh = async (req, res) => {
  try {
    const refreshToken = getRefreshCookie(req);

    if (!refreshToken) {
      return res.status(401).json({
        message: "No hay una sesión activa"
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      {
        algorithms: ["HS256"]
      }
    );

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive || !user.isEmailVerified) {
      clearRefreshCookie(res);

      return res.status(401).json({
        message: "Sesión no autorizada"
      });
    }

    const result = await rotateRefreshToken(
      refreshToken
    );

    if (!result) {
      clearRefreshCookie(res);

      return res.status(401).json({
        message: "Sesión inválida o revocada"
      });
    }

    setRefreshCookie(res, result.refreshToken);

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
      message: "Sesión renovada correctamente",
      accessToken
    });

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      clearRefreshCookie(res);

      return res.status(401).json({
        message: "Sesión inválida o expirada"
      });
    }

    console.error(
      "Error al renovar sesión:",
      error.message
    );

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

// ======================================
// CERRAR SESIÓN
// ======================================
const logout = async (req, res) => {
  try {
    const refreshToken = getRefreshCookie(req);

    if (!refreshToken) {
      clearRefreshCookie(res);

      return res.status(200).json({
        message: "Sesión cerrada correctamente"
      });
    }

    await revokeRefreshToken(refreshToken);
    clearRefreshCookie(res);

    return res.status(200).json({
      message: "Sesión cerrada correctamente"
    });

  } catch (error) {
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

    const tokenHash = hashToken(token.trim());

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
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ======================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Debes ingresar un correo válido"
      });
    }

    const genericMessage =
      "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.";

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      isActive: true
    }).select("+password");

    if (!user || !user.password) {
      return res.status(200).json({
        message: genericMessage
      });
    }

    const token = await createPasswordResetToken(user._id);

    await sendPasswordResetEmail(user.email, token);

    return res.status(200).json({
      message: genericMessage
    });

  } catch (error) {
    console.error(
      "Error al solicitar recuperación:",
      error.message
    );

    return res.status(500).json({
      message: "No se pudo procesar la solicitud. Inténtalo más tarde."
    });
  }
};

// ======================================
// ESTABLECER NUEVA CONTRASEÑA
// ======================================
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (
      typeof token !== "string" ||
      !token.trim() ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Token y nueva contraseña son obligatorios"
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "La contraseña debe tener entre 8 y 72 caracteres"
      });
    }

    const tokenHash = hashPasswordResetToken(token.trim());

    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({
        message: "Enlace de recuperación inválido o expirado"
      });
    }

    const user = await User.findById(
      resetRecord.userId
    ).select("+password");

    if (!user || !user.isActive || !user.password) {
      return res.status(400).json({
        message: "No se puede recuperar esta cuenta"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Consumir el token una sola vez
    const consumed = await PasswordResetToken.findOneAndUpdate(
      {
        _id: resetRecord._id,
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

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    // Revocar todas las sesiones anteriores
    await revokeAllUserRefreshTokens(user._id);

    // Eliminar los enlaces de recuperación anteriores
    await PasswordResetToken.deleteMany({
      userId: user._id
    });

    // Limpiar la cookie del navegador actual
    clearRefreshCookie(res);

    return res.status(200).json({
      message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
    });

  } catch (error) {
    console.error(
      "Error al restablecer contraseña:",
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
  verifyEmail,
  forgotPassword,
  resetPassword
};
