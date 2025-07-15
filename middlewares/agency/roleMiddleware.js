// Middleware pour vérifier les rôles d'un utilisateur
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // L'utilisateur doit être ajouté dans req.user par le middleware d'authentification
      if (!req.user) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Vérifie si le rôle de l'utilisateur est dans la liste des rôles autorisés
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès refusé: rôle non autorisé' });
      }

      // Rôle valide, on continue
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur dans la vérification des rôles' });
    }
  };
};
