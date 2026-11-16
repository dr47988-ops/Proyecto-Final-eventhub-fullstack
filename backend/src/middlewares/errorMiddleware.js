
const errorMiddleware = (err, req, res, next) => {
  const statusCode =
    err.statusCode || err.status || 500;

  // Registrar el error en el servidor
  console.error("Error en EventHub:", err);

  // Evitar mostrar información interna en producción
  const message =
    process.env.NODE_ENV === "production" &&
    statusCode === 500
      ? "Error interno del servidor"
      : err.message || "Error interno del servidor";

  return res.status(statusCode).json({
    message
  });
};

module.exports = errorMiddleware;
