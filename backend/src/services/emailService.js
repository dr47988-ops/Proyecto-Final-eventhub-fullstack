
const nodemailer = require("nodemailer");

// Configuración del servidor de correo
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

// Enviar correo de verificación
async function sendVerificationEmail(email, token) {
  const transporter = createTransporter();

  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Verifica tu correo - EventHub",
    text: `Bienvenido a EventHub.

Para verificar tu correo electrónico, abre este enlace:

${verificationUrl}

Este enlace vence en 30 minutos.

Si no creaste esta cuenta, ignora este mensaje.`
  });
}

// Enviar correo de recuperación de contraseña
async function sendPasswordResetEmail(email, token) {
  const transporter = createTransporter();

  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Recupera tu contraseña - EventHub",
    text: `Hola,

Recibimos una solicitud para restablecer la contraseña
de tu cuenta de EventHub.

Para crear una nueva contraseña, abre este enlace:

${resetUrl}

Este enlace vence en 30 minutos y solo puede
utilizarse una vez.

Si no solicitaste cambiar tu contraseña,
puedes ignorar este mensaje.

Equipo EventHub`
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
