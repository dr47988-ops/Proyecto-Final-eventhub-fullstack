
const express = require("express");
const { register } = require("../controllers/authController");

const router = express.Router();

// Registrar un usuario
router.post("/register", register);

module.exports = router;
