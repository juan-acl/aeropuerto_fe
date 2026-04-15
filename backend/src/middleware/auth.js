/**
 * JWT authentication middleware
 */
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'aurora-secret';

module.exports = function auth(requiredRole) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token requerido.' });
    }
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET);
      req.user = payload;
      if (requiredRole && payload.rol !== requiredRole && payload.rol !== 'ADMIN') {
        return res.status(403).json({ message: 'Sin permisos para esta acción.' });
      }
      next();
    } catch {
      res.status(401).json({ message: 'Token inválido o expirado.' });
    }
  };
};
