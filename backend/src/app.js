
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const swaggerSpec = require("./config/scalar");
const { apiReference } = require("@scalar/express-api-reference");

const app = express();

// ======================================
// SEGURIDAD CON HELMET
// ======================================

// Política de seguridad para Scalar.
// Se permite el script de su interfaz de documentación.
const scalarHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrcAttr: ["'none'"]
    }
  }
});

// Helmet general para las demás rutas
app.use((req, res, next) => {
  if (req.path.startsWith("/reference")) {
    return scalarHelmet(req, res, next);
  }

  return helmet()(req, res, next);
});

// ======================================
// CONFIGURACIÓN DE CORS
// ======================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ======================================
// MIDDLEWARES
// ======================================
app.use(express.json());
app.use(cookieParser());

// ======================================
// RUTA DE PRUEBA
// ======================================
app.get("/", (req, res) => {
  res.status(200).json({
    mensaje: "Bienvenido a la API de EventHub",
    estado: "Servidor funcionando correctamente"
  });
});

// ======================================
// RUTAS DE AUTENTICACIÓN
// ======================================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminUserRoutes);

// ======================================
// DOCUMENTACIÓN SCALAR
// ======================================
app.use(
  "/reference",
  apiReference({
    content: swaggerSpec,
    theme: "purple"
  })
);

// ======================================
// MANEJO CENTRALIZADO DE ERRORES
// ======================================
app.use(errorMiddleware);

// ======================================
// EXPORTAR APLICACIÓN
// ======================================
module.exports = app;
