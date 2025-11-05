const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware d'authentification et de restriction par rôle
 * @param {Array} allowedRoles - rôles autorisés (ex: ['super_admin'])
 */
const protect = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // Vérifie la présence du token
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
      }

      const token = authHeader.split(' ')[1];

      // Vérifie et décode le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }

      // Vérifie si le rôle de l'utilisateur est autorisé
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Accès refusé : rôle non autorisé.' });
      }

      // Attache l'utilisateur à la requête
      req.user = user;

      next();
    } catch (error) {
      console.error('Erreur auth middleware:', error.message);
      return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
  };
};

// ✅ Export direct : Express recevra bien une fonction et non un objet
module.exports = protect;
