import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isBlacklisted } from './tokenBlacklist.js';
import User from '../models/User.js';       // Chemin vers User
// import Agency from '../models/Agency.js'; // Pas obligatoire si populate fonctionne

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

      // Trouver l'utilisateur et "populer" agencyId pour récupérer agencyName
      const user = await User.findById(decoded._id || decoded.id).populate('agencyId');

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        agencyId: user.agencyId ? user.agencyId._id : null,
        agencyName: user.agencyId ? user.agencyId.agencyName || user.agencyId.name : null, 
        // selon que le champ s’appelle "agencyName" ou "name" dans ta collection agence
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
