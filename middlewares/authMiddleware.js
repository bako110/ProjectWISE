import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isBlacklisted } from './tokenBlacklist.js';

dotenv.config();

const authMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Accès refusé, token manquant' });
    }

    if (isBlacklisted(token)) {
      return res.status(403).json({ message: 'Token invalidé (blacklisté)' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded._id || decoded.id,
        role: decoded.role,
        email: decoded.email,
      };

      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Accès interdit : rôle non autorisé' });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: 'Token invalide', error: error.message });
    }
  };
};

export default authMiddleware;
