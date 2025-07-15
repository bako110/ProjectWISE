import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getClientProfile);
router.put('/profile', authMiddleware, updateClientProfile);

export default router;
