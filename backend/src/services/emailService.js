
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

module.exports = {
  sendVerificationEmail
};
