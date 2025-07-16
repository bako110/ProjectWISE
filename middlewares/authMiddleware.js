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

  if (isBlacklisted(token)) {
    return res.status(403).json({ message: 'Token invalidé (blacklisté)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ On s'assure que `req.user.id` existe
    req.user = {
      id: decoded._id || decoded.id,  // Utilise `_id` s’il existe, sinon `id`
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide', error: error.message });
  }
};

export default authMiddleware;
