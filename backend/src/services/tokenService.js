
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");

// Generar un hash SHA-256 del token
const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ======================================
// CREAR REFRESH TOKEN
// ======================================
const createRefreshToken = async (userId) => {
  const refreshToken = jwt.sign(
    {
      userId: userId.toString(),
      jti: crypto.randomUUID()
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
      algorithm: "HS256"
    }
  );

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    { algorithms: ["HS256"] }
  );

  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000)
  });

  return refreshToken;
};

// ======================================
// RENOVAR REFRESH TOKEN
// ======================================
const rotateRefreshToken = async (token) => {
  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET,
    { algorithms: ["HS256"] }
  );

  const tokenHash = hashToken(token);

  // Revocar el token anterior de forma atómica
  const session = await RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      user: decoded.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    },
    {
      $set: { revokedAt: new Date() }
    },
    { new: true }
  );

  if (!session) {
    return null;
  }

  const newRefreshToken = await createRefreshToken(
    session.user
  );

  return {
    userId: session.user,
    refreshToken: newRefreshToken
  };
};

// ======================================
// REVOCAR REFRESH TOKEN (LOGOUT)
// ======================================
const revokeRefreshToken = async (token) => {
  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET,
    { algorithms: ["HS256"] }
  );

  const session = await RefreshToken.findOneAndUpdate(
    {
      tokenHash: hashToken(token),
      user: decoded.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    },
    {
      $set: { revokedAt: new Date() }
    },
    { new: true }
  );

  return Boolean(session);
};

// ======================================
// REVOCAR TODAS LAS SESIONES DEL USUARIO
// ======================================
const revokeAllUserRefreshTokens = async (userId) => {
  const result = await RefreshToken.updateMany(
    {
      user: userId,
      revokedAt: null
    },
    {
      $set: {
        revokedAt: new Date()
      }
    }
  );

  return result.modifiedCount;
};

module.exports = {
  hashToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens
};
