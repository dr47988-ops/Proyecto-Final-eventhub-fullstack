
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado"
      });
    }

    // Verificar si tiene un rol autorizado
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permisos para acceder a esta función"
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
