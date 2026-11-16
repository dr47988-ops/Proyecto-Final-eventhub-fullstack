
const crypto = require("crypto");
const EmailVerificationToken = require("../models/EmailVerificationToken");

const TOKEN_EXPIRATION_MINUTES = 30;

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

async function createEmailVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000
  );

  // Invalidar enlaces anteriores del mismo usuario
  await EmailVerificationToken.deleteMany({
    user: userId
  });

  await EmailVerificationToken.create({
    user: userId,
    tokenHash,
    expiresAt
  });

  return token;
}

module.exports = {
  createEmailVerificationToken,
  hashToken
};
