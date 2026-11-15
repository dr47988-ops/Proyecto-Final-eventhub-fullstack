
const express = require("express");

const app = express();

// Permitir recibir datos en formato JSON
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido a la API de EventHub",
    estado: "Servidor funcionando correctamente"
  });
});

module.exports = app;
