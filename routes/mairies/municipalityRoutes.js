import express from 'express';
import { registerMunicipality } from '../../controllers/mairies/municipalityControllers.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/municipality/register
router.post('/municipality', authMiddleware('super_admin'), registerMunicipality);

export default router;
