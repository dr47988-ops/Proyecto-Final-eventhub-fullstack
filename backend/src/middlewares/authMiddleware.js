
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token de la cabecera Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token de acceso requerido"
      });
    }

    const token = authHeader.split(" ")[1];

    // Verificar que el token sea válido
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Buscar al usuario en MongoDB
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Usuario no autorizado"
      });
    }

    // Guardar información del usuario en la solicitud
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        message: "Token inválido o expirado"
      });
    }

    console.error("Error de autenticación:", error.message);

    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};

module.exports = authMiddleware;
