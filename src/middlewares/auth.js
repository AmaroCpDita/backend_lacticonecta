const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlacticonecta2026';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'Un token es requerido para la autenticación' });
  }
  
  try {
    const bearer = token.split(' ')[1]; // "Bearer TOKEN"
    const decoded = jwt.verify(bearer, JWT_SECRET);
    req.userId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  return next();
};

module.exports = { verifyToken };
