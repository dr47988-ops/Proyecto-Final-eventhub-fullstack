
const express = require("express");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Permitir recibir datos JSON
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido a la API de EventHub",
    estado: "Servidor funcionando correctamente"
  });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

module.exports = app;
