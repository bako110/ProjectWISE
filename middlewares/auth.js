import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur depuis la DB pour info à jour
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        agencyId: user.agencyId,          // récupéré depuis la DB
        isOwnerAgency: user.isOwnerAgency // récupéré depuis la DB
      };

      // Vérification du rôle si nécessaire
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  };
};
