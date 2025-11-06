import jwt from 'jsonwebtoken';

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        agencyId: decoded.agencyId,
        isOwnerAgency: decoded.isOwnerAgency
      };

      // Vérification du rôle si des rôles sont spécifiés
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }
  };
};
