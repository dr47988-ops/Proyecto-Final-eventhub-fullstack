
const crypto = require("crypto");

const PasswordResetToken = require("../models/PasswordResetToken");

const TOKEN_EXPIRATION_MINUTES = 30;

// Convertir el token en un hash seguro
function hashPasswordResetToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

// Generar un token para recuperar la contraseña
async function createPasswordResetToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = hashPasswordResetToken(token);

  const expiresAt = new Date(
    Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );

  // Invalidar enlaces anteriores del mismo usuario
  await PasswordResetToken.deleteMany({
    userId
  });

  // Guardar únicamente el hash del token
  await PasswordResetToken.create({
    userId,
    tokenHash,
    expiresAt
  });

  // El token original se utilizará para enviar el enlace
  return token;
}

module.exports = {
  createPasswordResetToken,
  hashPasswordResetToken
};
