import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isBlacklisted } from './tokenBlacklist.js';
import User from '../models/User.js';
import Agency from '../models/Agency/Agency.js';

dotenv.config();

const authMiddleware = (requiredRole) => {
  return async (req, res, next) => {
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

      // Récupérer l'utilisateur (sans populate)
      const user = await User.findById(decoded._id || decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      // Trouver l'agence associée à cet utilisateur (userId dans Agency)
      const agency = await Agency.findOne({ userId: user._id });

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        agencyId: agency ? agency._id : null,
        agencyName: agency ? agency.agencyName : null,
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
