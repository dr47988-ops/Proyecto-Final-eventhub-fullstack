
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  createRefreshToken
} = require("../services/tokenService");

const {
  setRefreshCookie
} = require("../utils/authCookies");

const googleClient = new OAuth2Client();

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body || {};

    if (
      typeof credential !== "string" ||
      !credential.trim()
    ) {
      return res.status(400).json({
        message: "La credencial de Google es obligatoria"
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID no está configurado");

      return res.status(500).json({
        message: "Google no está configurado en el servidor"
      });
    }

    // Verificar la credencial con Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential.trim(),
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        message: "No se pudo verificar la cuenta de Google"
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();

    const name =
      typeof payload.name === "string" &&
      payload.name.trim()
        ? payload.name.trim().slice(0, 100)
        : email.split("@")[0].slice(0, 100);

    // Buscar primero una cuenta vinculada a Google
    let user = await User.findOne({ googleId });

    if (!user) {
      // Evitar vincular automáticamente una cuenta existente
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          message:
            "Este correo ya tiene una cuenta en EventHub. Inicia sesión con tu método habitual."
        });
      }

      // Crear usuario nuevo con rol de asistente
      user = await User.create({
        name,
        email,
        googleId,
        role: "attendee",
        isEmailVerified: true,
        isActive: true
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Cuenta desactivada"
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "La cuenta no está verificada"
      });
    }

    // Crear sesión normal de EventHub
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
      message: "Inicio de sesión con Google exitoso",
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
    // Errores de credenciales inválidas o expiradas
    if (
      error.message &&
      (
        error.message.includes("Wrong recipient") ||
        error.message.includes("Token used too late") ||
        error.message.includes("Invalid token signature") ||
        error.message.includes("No pem found") ||
        error.message.includes("Invalid token")
      )
    ) {
      return res.status(401).json({
        message: "Credencial de Google inválida o expirada"
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "La cuenta ya existe. Intenta iniciar sesión nuevamente."
      });
    }

    console.error(
      "Error al iniciar sesión con Google:",
      error.message
    );

    return res.status(500).json({
      message: "No se pudo iniciar sesión con Google"
    });
  }
};

module.exports = googleLogin;
