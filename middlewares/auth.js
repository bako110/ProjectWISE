const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const logger = require('../utils/logger.js');

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn({
          msg: 'Authentification échouée - Token manquant',
          url: req.url,
          method: req.method,
          ip: req.ip,
          duration: Date.now() - startTime
        });
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      
      if (!user) {
        logger.warn({
          msg: 'Authentification échouée - Utilisateur non trouvé',
          userId: decoded.id,
          url: req.url,
          duration: Date.now() - startTime
        });
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
      };

      if (roles.length && !roles.includes(user.role)) {
        logger.warn({
          msg: 'Accès refusé - Rôle insuffisant',
          userId: user._id.toString(),
          userRole: user.role,
          requiredRoles: roles,
          url: req.url,
          duration: Date.now() - startTime
        });
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      logger.info({
        msg: 'Authentification réussie',
        userId: user._id.toString(),
        role: user.role,
        ip: req.ip,
        url: req.url,
        method: req.method,
        duration: Date.now() - startTime
      });

      next();
      
    } catch (err) {
      logger.error({
        msg: 'Erreur d\'authentification',
        error: err.message,
        errorType: err.name,
        url: req.url,
        method: req.method,
        duration: Date.now() - startTime
      });
      
      return res.status(401).json({ 
        message: err.name === 'TokenExpiredError' 
          ? 'Token expiré' 
          : 'Token invalide' 
      });
    }
  };
};

module.exports = authMiddleware;
