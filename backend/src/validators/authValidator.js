
const { body, validationResult } = require("express-validator");

// Revisar los errores de validación
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Datos de entrada inválidos",
      errors: errors.array()
    });
  }

  next();
};

// Validar registro
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Ingrese un correo válido")
    .normalizeEmail(),

body("password")
  .isString()
  .withMessage("La contraseña debe ser un texto")
  .bail()
  .isLength({ min: 8, max: 72 })
  .withMessage("La contraseña debe tener entre 8 y 72 caracteres"),

  validateRequest
];

// Validar inicio de sesión
const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Ingrese un correo válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),

  validateRequest
];

// Validar solicitud de recuperación
const validateForgotPassword = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Ingrese un correo válido")
    .normalizeEmail(),

  validateRequest
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword
};
