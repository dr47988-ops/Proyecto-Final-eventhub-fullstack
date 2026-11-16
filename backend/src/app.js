
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");

const app = express();

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

// ======================================
// EXPORTAR APLICACIÓN
// ======================================
module.exports = app;
