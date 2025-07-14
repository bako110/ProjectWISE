import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isBlacklisted } from './tokenBlacklist.js';

dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant' });
  }

  // Vérifie si le token a été blacklisté
  if (isBlacklisted(token)) {
    return res.status(403).json({ message: 'Token invalidé (blacklisté)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ajoute les infos utilisateur à la requête
    next(); // Autorise la suite
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

export default authMiddleware;
