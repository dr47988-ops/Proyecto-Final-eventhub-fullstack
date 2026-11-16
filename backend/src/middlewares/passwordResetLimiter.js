
const { rateLimit } = require("express-rate-limit");

// Limitar solicitudes de recuperación de contraseña
const passwordResetLimiter = rateLimit({
  // Ventana de 15 minutos
  windowMs: 15 * 60 * 1000,

  // Máximo 5 solicitudes por dirección IP
  limit: 5,

  // Respuesta cuando se supera el límite
  message: {
    message:
      "Has realizado demasiadas solicitudes de recuperación. Inténtalo nuevamente en 15 minutos."
  },

  // Enviar encabezados estándar
  standardHeaders: "draft-8",

  // Ocultar encabezados antiguos
  legacyHeaders: false
});

module.exports = passwordResetLimiter;
