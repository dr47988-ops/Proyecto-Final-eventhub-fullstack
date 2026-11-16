
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

// Crear y guardar un refresh token
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


const rotateRefreshToken = async (token) => {
  // Verificar firma y vencimiento del JWT
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

  // Generar un nuevo refresh token
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
   // Verificar firma y vencimiento
   const decoded = jwt.verify(
     token,
     process.env.JWT_REFRESH_SECRET,
     { algorithms: ["HS256"] }
   );

   // Buscar el token activo y revocarlo
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


module.exports = {
  hashToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken
};